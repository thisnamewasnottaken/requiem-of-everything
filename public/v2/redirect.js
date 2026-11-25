const destination = new URL(document.getElementById('destination').href);
destination.search = location.search;
destination.hash = location.hash;
location.replace(destination);
