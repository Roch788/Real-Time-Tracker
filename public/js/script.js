const socket = io();

let myLocation = null;
let autoFollow = true;
let routes = {}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            myLocation = [latitude, longitude]
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,  //actually take the data , don't use the cachce data
        }
    )
}

const map = L.map("map").setView([0, 0], 16);
const locateBtn = document.getElementById("locateBtn");
const followBtn = document.getElementById("followBtn")


function getRandomcolor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
locateBtn.addEventListener("click", () => {
    if (myLocation) {
        map.setView(myLocation, 16);

    }
    else {
        alert("location not available")
    }
})

followBtn.addEventListener("click", () => {
    autoFollow = !autoFollow;
    if (autoFollow) {
        followBtn.innerText = "🧭 Auto-Follow: ON";
        followBtn.classList.remove("off");
    } else {
        followBtn.innerText = "🧭 Auto-Follow: OFF";
        followBtn.classList.add("off");
    }
})
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map)

const markers = {

}

socket.on("receive-location", (data) => {    
    const { id, latitude, longitude } = data;
    const latLng = [latitude, longitude];
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    }
    else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    if (!routes[id]) {
        routes[id] = L.polyline([latLng], {
            color: getRandomcolor(),
            weight: 4
        }).addTo(map)
    } else {
        routes[id].addLatLng(latLng)
    }
})

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id]
    }
})