console.log("Lets write Javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                  <img class="invert" src="images/music.svg" alt="music">
                  <div class="info">
                    <div>   ${song.replaceAll("%20", " ")}</div>
                    <div>Atharva</div>
                  </div>
                  <div class="playnow">
                    <span>Play</span>
                    <img class="invert" src="images/playsong.svg" alt="playnow">
                  </div>
      
   </li>`;
  }

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

    //Add an event listener to previous
    previous.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
      }
    });
  
    //Add an event listener to next
    next.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    });
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


// async function displayAlbums() {
//   try {
//     let a = await fetch(`http://127.0.0.1:5500/songs/`);
//     let response = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let anchors = div.getElementsByTagName("a");

//     Array.from(anchors).forEach(async (e) => {
//       if (e.href.includes("/songs")) {
//         // Extract the folder name correctly
//         let url = new URL(e.href);
//         let folder = url.pathname.split("/").slice(-2, -1)[0];
//         console.log(`Folder: ${folder}`); // Log the folder name

//         // Construct the URL for info.json
//         let songUrl = `http://127.0.0.1:5500/songs/${folder}/info.json`;
//         console.log(`Requesting: ${songUrl}`); // Log the URL

//         try {
//           let a = await fetch(songUrl);
//           if (!a.ok) {
//             throw new Error(`HTTP error! status: ${a.status}`);
//           }
//           let response = await a.json();
//           console.log(response);
//         } catch (error) {
//           console.error(
//             `Error fetching info.json for folder ${folder}:`,
//             error
//           );
//         }
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching song list:", error);
//   }
// }

async function main() {
  // get the list of all songs
  await getSongs("songs/cs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  // displayAlbums();

  //Attach an event listener to next, play and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/playsong.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(
      currentSong.currentTime
    )} / ${convertSecondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });



  // document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) =>{
  //   currentSong.volume = parseInt(e.target.value) / 100
  // })
  //Add event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      let volumeValue = parseFloat(e.target.value);

      // Validate the volume value
      if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 100) {
        currentSong.volume = volumeValue / 100;
      } else {
        console.error("Invalid volume value:", volumeValue);
      }
    });

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });

  //Add an event listener to mute the track
  document.querySelector(".volume > img").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
      currentSong.volume = 0;
      dpcument
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
