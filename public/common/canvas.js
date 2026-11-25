// Firefox on hybrid-GPU laptops can draw a canvas on one GPU and composite it on the other,
// which shows black. There, keep WebGL on the low-power GPU and draw 2D canvases in software.
window.ROE_CANVAS = 'mozInnerScreenX' in window
  ? { gl: { powerPreference: 'low-power' }, c2d: { willReadFrequently: true } }
  : { gl: {}, c2d: {} };
