let map;

document.addEventListener("DOMContentLoaded", function(event) {
  const mapdiv = document.querySelector('.map');
  const co = { lat: 38, lng: -8};
  map = new MapFunctions(mapdiv, co).init();
  map.drawgrid();
});

document.addEventListener('click', function(e){
  if(e.target.id === 'submitForm'){
    e.preventDefault();
    let constraints = {
      maxdistance: document.querySelector('#maxdistance').value,
      mindistance: document.querySelector('#mindistance').value,
      maxgradient: document.querySelector('#maxgradient').value,
      mingradient: document.querySelector('#mingradient').value,
      straightness: document.querySelector('#straightness').value,
      bounds: map.getBounds()
    };

    xhr(constraints, '/climbs', (climbs)=>{
      console.log(climbs);
      JSON.parse(climbs).forEach((climb, i) => {
        let line = map.drawline(climb);

      });

    });
  }
});


function MapFunctions(baseelem, coordinates){
  let displayed = false;
  let map;

  this.init = init;
  this.invalidateSize = invalidate;
  this.addMarker = addMarker;
  this.getBounds = ()=>{
    map.getBounds();
  },
  this.drawgrid = ()=>{
    xhrget(null, '/gridlines', (coordinates)=>{
      console.log(typeof coordinates);
      JSON.parse(coordinates).forEach((item, i) => {
        var polyline = L.polyline(item, {color: 'red'}).addTo(map);
      });

    });
  }



  this.drawline = (climb)=>{
    let polyline = L.polyline(climb.points, {color: 'orange'}).addTo(map);
    let popup = L.popup();
    let content = `Estimated ascent: ${Math.round(climb.ascent)} m,
                   Distance: ${climb.distance.toFixed(3)} km,
                   Gradient: ${((climb.ascent / (climb.distance * 1000)) * 100).toFixed(1)} %,
                   Straightness: ${climb.straightness.toFixed(2)}, `;
    let href = `https://www.google.com/maps/search/?api=1&query=${climb.points[0].lat},${climb.points[0].lng}`;
    let link = `<a href=${href} target='_blank'>Google maps link (street view)</a>`;
    polyline.bindPopup(popup);
    popup.setLatLng(climb.points[0]);
    popup.setContent(content + link);
    addClimb(content, popup, href);
  };

  function addClimb(content, popup, href){
    let p = document.createElement('p');
        p.textContent = content + ' ';
        document.querySelector('.climbs').appendChild(p);

    let a = document.createElement('a');
        a.setAttribute('href', href);
        a.setAttribute('target', '_blank');
        a.textContent = 'Google maps link (street view)';
        p.appendChild(a);

    p.addEventListener('click', (e)=>{
      popup.openOn(map);
      document.querySelector('.map').scrollIntoView({behavior: "smooth", block: "center"});
    })
  }

  function init(){
    if(displayed === false){
      let mapdiv = document.createElement('div');
      if(typeof baseelem === 'string'){
        document.querySelector(baseelem).appendChild(mapdiv);
      }
      if( typeof baseelem === 'object'){
        baseelem.appendChild(mapdiv);
      }

      let mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
      let ocmlink = '<a href="http://thunderforest.com/">Thunderforest</a>';

      map = L.map(mapdiv, { layers: [
        //L.tileLayer('https://api.mapbox.com/styles/v1/tomasmetcalfe/cj2g0l3mv00bo2rqnyj126oay/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXNtZXRjYWxmZSIsImEiOiIwcmtHaUZJIn0.57tHqOqvSIhVn6co2_g2yA', {
        L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=ac75df8345724f518ad6b483690151f8', {
          attribution: '&copy; '+mapLink+' Contributors & '+ocmlink,
        })],
        preferCanvas: true,
        center: coordinates,
        zoom: 8
      });
      L.control.scale().addTo(map).setPosition('bottomright');
    }

    displayed = true;
    return this;
  };

  function invalidate(){
    return map.invalidateSize();
  };

  function addMarker(lat, lng){
    let marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup('Coordinates: ' + lat + ',' + lng).openPopup();
    map.setView([lat, lng], 11);
  };

}
