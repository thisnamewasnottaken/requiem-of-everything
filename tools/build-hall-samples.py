import json
import re
import subprocess
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SAMPLES = ROOT / "samples"
VSCO = "https://raw.githubusercontent.com/sgossner/VSCO-2-CE/master/"
SSO = "https://raw.githubusercontent.com/peastman/sso/master/"
NOTE_RE = re.compile(r"(?<![A-Za-z])([A-G])([#b-]?)([0-8])(?!\d)", re.I)
NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
PATCH_SETTINGS = {
    "violin": (.10, .9), "viola": (.10, .9), "cello": (.10, 1.0),
    "bass": (.12, 1.0), "pizz": (.005, .6), "harp": (.005, 2.2),
    "flute": (.06, .6), "piccolo": (.05, .5), "oboe": (.05, .5),
    "clarinet": (.05, .6), "bassoon": (.05, .6), "horn": (.12, 1.0),
    "trumpet": (.03, .6), "trombone": (.06, .8), "tuba": (.08, .9),
    "timpani": (.002, 2.5), "glock": (.002, 2.0), "harpsichord": (.002, .9),
    "piano": (.002, 1.6), "organ": (.15, 1.8), "celesta": (.002, 2.0),
    "choir": (.4, 1.8), "oohs": (.35, 1.6),
}
VSCO_DIRS = {
    "violin": "Strings/Violin Section/susVib/",
    "viola": "Strings/Viola Section/susvib/",
    "cello": "Strings/Cello Section/susvib/",
    "bass": "Strings/Solo Contrabass/SusVib/",
    "flute": "Woodwinds/Flute/susNV/",
    "piccolo": "Woodwinds/Piccolo/Sus/",
    "oboe": "Woodwinds/Oboe/Sus/",
    "clarinet": "Woodwinds/Clarinet/susLong/",
    "bassoon": "Woodwinds/Bassoon/sus/",
    "horn": "Brass/F Horn/sus/",
    "trumpet": "Brass/Trumpet/sus/",
    "trombone": "Brass/Tenor Trombone/sus/",
    "tuba": "Brass/Tuba/sus/",
    "harp": "Strings/Harp/",
    "glock": "Percussion/Glock/",
}


def tree(repo):
    result = subprocess.check_output(
        ["gh", "api", f"repos/{repo}/git/trees/master?recursive=1"], text=True
    )
    return json.loads(result)["tree"]


def midi_for(token):
    match = NOTE_RE.fullmatch(token)
    if not match:
        return None
    letter, accidental, octave = match.groups()
    semitone = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}[letter.upper()]
    semitone += 1 if accidental == "#" else -1 if accidental.lower() in ("b", "-") else 0
    return (int(octave) + 1) * 12 + semitone


def note_in(path):
    match = NOTE_RE.search(Path(path).stem)
    return midi_for("".join(match.groups())) if match else None


def variation(path):
    match = re.search(r"[_-]v(\d+)(?:[_\-.]|$)", path, re.I)
    return int(match.group(1)) if match else 0


def grouped(files, note_fn=note_in):
    result = defaultdict(list)
    for path in files:
        note = note_fn(path)
        if note is not None:
            result[note].append(path)
    return result


def choose_single(files):
    return sorted(files, key=lambda path: (variation(path), "rr1" not in path.lower(), path))[
        len(files) // 2
    ]


def note_files(tree_items, prefix):
    return sorted(
        item["path"] for item in tree_items
        if item["path"].startswith(prefix)
        and item["path"].lower().endswith((".wav", ".flac"))
    )


def make_layer(files_by_note, source, layered=False, choose=None):
    notes = {}
    for note, files in sorted(files_by_note.items()):
        selected = choose(files) if choose else choose_single(files)
        notes[str(note)] = (source, selected)
    return notes


def make_velocity_layers(files_by_note, source):
    soft, loud = {}, {}
    for note, files in sorted(files_by_note.items()):
        ordered = sorted(files, key=lambda path: (variation(path), path))
        soft[str(note)] = (source, ordered[0])
        if len(ordered) > 1:
            loud[str(note)] = (source, ordered[-1])
    return soft, loud


def raw_bytes(source, path):
    url = source + urllib.parse.quote(path, safe="/")
    request = urllib.request.Request(url, headers={"User-Agent": "Hall-sample-builder"})
    error = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except Exception as exc:
            error = exc
    raise error


def convert(asset):
    patch, note, source, source_path, output_path = asset
    dest = ROOT / urllib.parse.unquote(output_path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_file():
        return patch, note, source_path, dest
    audio = raw_bytes(source, source_path)
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", "pipe:0",
            "-af",
            "silenceremove=start_periods=1:start_duration=0.04:start_threshold=-55dB,"
            "atrim=duration=6,afade=t=out:st=5.7:d=0.3",
            "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k",
            str(dest),
        ],
        input=audio,
        check=True,
    )
    return patch, note, source_path, dest


def main():
    vsco_tree = tree("sgossner/VSCO-2-CE")
    sso_tree = tree("peastman/sso")
    patch_layers = {}

    for patch, directory in VSCO_DIRS.items():
        files = note_files(vsco_tree, directory)
        if patch == "harp":
            files = [path for path in files if not path.endswith("KSHarp_G1_mp.wav")]
        if patch in ("violin", "viola", "cello", "bass", "horn"):
            patch_layers[patch] = make_velocity_layers(grouped(files), "vsco")
        else:
            patch_layers[patch] = (make_layer(grouped(files), "vsco"),)

    pizz_files = note_files(vsco_tree, "Strings/Violin Section/Pizz/")
    patch_layers["pizz"] = (make_layer(grouped(pizz_files), "vsco"),)

    timpani = []
    for drum, note in zip(range(1, 6), (42, 54, 56, 53, 61)):
        path = f"Percussion/Timpani/Timpani{drum}_Hit_v3_rr1_Sum.wav"
        timpani.append((note, ("vsco", path)))
    patch_layers["timpani"] = (dict((str(note), sample) for note, sample in timpani),)

    organ_files = note_files(vsco_tree, "Keys/Organ/Loud/")
    organ_notes = {}
    for path in organ_files:
        match = re.search(r"Rode_Man3Open_(\d+)\.wav$", path)
        if match:
            note = 47 + int(match.group(1))
            organ_notes[str(note)] = ("vsco", path)
    patch_layers["organ"] = (organ_notes,)

    piano_files = [
        path for path in note_files(vsco_tree, "Keys/Upright Piano/")
        if "Player_dyn2_rr1_" in path
    ]
    piano_notes = {}
    for path in piano_files:
        match = re.search(r"_(\d+)\.wav$", path)
        if match:
            note = 21 + int(match.group(1)) * 2
            piano_notes[str(note)] = ("vsco", path)
    patch_layers["piano"] = (piano_notes,)

    sso_prefix = "Sonatina Symphonic Orchestra/Samples/"
    harpsi_files = note_files(sso_tree, sso_prefix + "Harpsichord/Sustains/")
    harpsi_groups = grouped(harpsi_files)
    harpsi_notes = {}
    for note, files in harpsi_groups.items():
        region = "Low/" if note < 60 else "High/"
        matching = [path for path in files if f"/{region}" in path]
        harpsi_notes[str(note)] = ("sso", choose_single(matching or files))
    patch_layers["harpsichord"] = (harpsi_notes,)

    celeste_files = [
        path for path in note_files(sso_tree, sso_prefix + "Celeste/")
        if path.endswith("-soft.flac")
    ]
    patch_layers["celesta"] = (make_layer(grouped(celeste_files), "sso"),)

    choir_files = note_files(sso_tree, sso_prefix + "Chorus/")
    choir_notes = make_layer(grouped(choir_files), "sso")
    patch_layers["choir"] = (choir_notes,)
    patch_layers["oohs"] = (choir_notes,)

    manifest = {}
    assets = []
    inventory = {}
    for patch, layers in patch_layers.items():
        output_layers = []
        for index, layer in enumerate(layers):
            if not layer:
                continue
            velocity = [0, 76] if len(layers) == 2 and index == 0 else (
                [77, 127] if len(layers) == 2 else [0, 127]
            )
            output_notes = {}
            for note_text, (source, source_path) in layer.items():
                note = int(note_text)
                web_note = NOTE_NAMES[note % 12].replace("#", "%23")
                layer_suffix = ("-soft" if index == 0 else "-loud") if len(layers) == 2 else ""
                output_path = f"samples/{patch}/{web_note}{note // 12 - 1}{layer_suffix}.mp3"
                output_notes[note_text] = output_path
                assets.append((patch, note, VSCO if source == "vsco" else SSO, source_path, output_path))
            output_layers.append({"vel": velocity, "notes": output_notes})
        attack, release = PATCH_SETTINGS[patch]
        manifest[patch] = {"layers": output_layers, "attack": attack, "release": release}
        inventory[patch] = sum(len(layer["notes"]) for layer in output_layers)

    SAMPLES.mkdir(exist_ok=True)
    failures = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(convert, asset) for asset in assets]
        for future in as_completed(futures):
            try:
                patch, note, source_path, dest = future.result()
                print(f"{patch}: {note} <- {source_path} ({dest.stat().st_size} bytes)")
            except Exception as exc:
                failures.append(str(exc))
                print(f"FAILED: {exc}")
    if failures:
        raise SystemExit(f"{len(failures)} sample conversions failed")

    expected = {ROOT / urllib.parse.unquote(asset[-1]) for asset in assets}
    for path in SAMPLES.rglob("*.mp3"):
        if path not in expected:
            path.unlink()
    (SAMPLES / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    total = sum(path.stat().st_size for path in SAMPLES.rglob("*.mp3"))
    for patch, count in inventory.items():
        size = sum(path.stat().st_size for path in (SAMPLES / patch).glob("*.mp3"))
        source = "SSO" if patch in ("harpsichord", "celesta", "choir", "oohs") else "VSCO 2 CE"
        print(f"INVENTORY {patch}: {source}, {count} notes, {size / 1024:.1f} KiB")
    print(f"TOTAL: {total / (1024 * 1024):.2f} MiB in {len(assets)} samples")
    if total > 60 * 1024 * 1024:
        raise SystemExit("Sample budget exceeded: 60 MiB")


if __name__ == "__main__":
    main()
