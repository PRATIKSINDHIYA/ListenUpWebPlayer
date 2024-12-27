let currentSong = new Audio();
let currentIndex = 0; 

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "show";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Get the list of songs
async function getSongs() {
    let api = await fetch("http://127.0.0.1:5500/songs/");
    let response = await api.text();

    let parser = new DOMParser();
    let doc = parser.parseFromString(response, "text/html");

    let ulElement = doc.querySelector(".directory ul.view-tiles");
    let songs = [];
    if (ulElement) {
        let listItems = ulElement.querySelectorAll("li");
        listItems.forEach((li) => {
            let linkElement = li.querySelector("a");
            if (linkElement) {
                let href = linkElement.getAttribute("href");
                if (href.endsWith(".mp3")) {
                    let fullUrl = "http://127.0.0.1:5500" + href;
                    songs.push(fullUrl.split("/songs/")[1]);
                }
            }
        });
    } else {
        console.log("No matching <ul> found.");
    }
    return songs;
}

// Play the selected song
const playMusic = (track, pause = false) => {
    currentSong.src = "/songs/" + track;
    if (!pause) {
        currentSong.play();
        play.src = "/svgs/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00";
    document.querySelector(".songduration").innerHTML = "00:00";
};

async function main() {
    let songs = await getSongs();
    playMusic(songs[0], true);

    let songUl = document.querySelector(".songList ul");
    let songUM = document.querySelector(".cardcontainer");

    for (const song of songs) {
        // Decode and process song name
        const decodedFileName = decodeURIComponent(song);
        const withoutExtension = decodedFileName.replace('.mp3', '');
        const parts = withoutExtension.split(' - ');

        const title = parts[0]?.trim() || "Khila Khila ke Pizza Chhatpar daboche, jija ";
        const artist = parts[1]?.trim() || "Pratik Sindhiya";


        // Add to song list (ul)
        songUl.innerHTML += `<li>
            <img src="/svgs/musiclogo.svg" class="musiclogo invert" alt="">
            <div class="info">
                <div>${title}</div>
                <div>${artist}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img id="plays" src="/svgs/plays.svg" alt="">
            </div>
        </li>`;

        // Use the title to fetch the corresponding image
        let imagePath = `/image/${title}.jpg`;
        let fallbackImage = `default.jpg`;

                    songUM.innerHTML += `<div class="card">
            <svg class="playbutton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="50px" height="50px">
                <rect width="256" height="256" fill="none"></rect>
                <circle cx="128" cy="128" r="120" fill="#1ed760"></circle>
                <path fill="black" d="M108,88 L180,128 L108,168 Z"></path>
            </svg>
            <img src="${imagePath}" alt="error" onerror="this.src='${fallbackImage}'">
            <h4 class="h">${title}</h4>
            <p class="p">${artist}</p>
            </div>`;
                }

    // Add event listeners for each song in the list
    Array.from(songUl.getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    Array.from(songUM.getElementsByClassName("card")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/svgs/play.svg";
        }
    });
    

    currentSong.addEventListener("timeupdate", () => {
        // Update the running time
        document.querySelector(".songtime").innerHTML = secondsToMinutesSeconds(currentSong.currentTime);

        // Update the total song length (duration)
        document.querySelector(".songduration").innerHTML = secondsToMinutesSeconds(currentSong.duration);

        // Update the progress bar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".leftcontainer").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".leftcontainer").style.left = "-120%";
    });

    document.querySelector("#next").addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[currentIndex]);
    });

    document.querySelector("#previous").addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[currentIndex]);
    });

    document.getElementById("volume").addEventListener("input", (e) => {
        currentSong.volume = e.target.value;
    });

    currentSong.volume = 0.5; 
}

main()