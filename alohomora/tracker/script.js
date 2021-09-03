(() => {
  async function getThreads() {
    const sheetid = "1i7n16UutWosVtHLkEFEkAdswAv0xIyrO1GuVdyyW6kM";
    const queryparameters = "A2:H";
    const apikey = "AIzaSyBmN9-hpKVcVJ5KGgCD_9fXtqRAIIIj9ok";
    // update api permissions at https://console.cloud.google.com/

    const cache = cacheThreads();

    let threads = cache.get();

    if (!threads) {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetid}/values/Threads!${queryparameters}/?key=${apikey}`
      );
      threads = (await response.json()).values;
      threads = sortThreads(threads);
      cache.set(threads);
    }

    createLayout(threads);

    return threads;
  }

  function cacheThreads() {
    /* threadsData = { expires: TIME, data: DATA } */

    function get() {
      const cached = JSON.parse(localStorage.getItem("iz-threads"));
      if (!cached) return null;
      const isExpired = Date.now() > cached.expires;
      if (isExpired) return null;
      return cached.data;
    }

    function set(data) {
      const HOUR = 60 * 60 * 1000;
      const timestamp = Date.now() + 12 * HOUR;
      localStorage.setItem(
        "iz-threads",
        JSON.stringify({ expires: timestamp, data })
      );
    }

    return { get, set };
  }

  function sortThreads(threads) {
    /* should return as:
    threads = {
      character:
        { section: [ thread, thread, thread],
          section: [thread, thread] },
      character:
        { section: [ thread, thread, thread],
          section: [thread, thread] }
    } */

    return threads.reduce((acc, currentThread) => {
      let [url, title, participants, location, notes, timeline, status, chara] =
        currentThread;


      if (!url || !chara ) {
        return acc;
      }

      chara = chara.toLowerCase();

      if (!(chara in acc)) {
        acc[chara] = { Past: [] };
      }

      if (!(timeline in acc[chara])) {
        acc[chara][timeline] = [];
      }

      acc[chara][timeline].push({ url, title, participants, notes, status, location });

      return acc;
    }, {});
  }

  function createLayout(threads) {
    const trackerEl = document.querySelectorAll("izzy-tracker");

    trackerEl.forEach((el) => {
      const char = el.dataset.character;

      let ongoingThreads = 0;
      let totalThreads = 0;

      const template = `
    ${Object.entries(threads[char]).map(([title, threads]) => {
        if (threads.length === 0) return "";

        return `<section>
        <h1 class="threadAct">${title}</h1>
        <div class="threadList">
          ${threads.map(thread => {
          totalThreads++;
          if (thread.status.toLowerCase() === "ongoing") { ongoingThreads++; }

          return `<thread class="${thread.status.toLowerCase()}">
          <a href="${thread.url}">${thread.title}</a>
          <p>${[thread.participants ? `with ${thread.participants.toLowerCase()}` : "", thread.location ? `at ${thread.location.toLowerCase()}` : "", thread.notes ? `(${thread.notes})` : ``].filter(val => val).join(" - ")}</p>
          </thread>`
        }).join("")}
        </div>
        </section>`
      }).reverse().join("")
        }`

      el.querySelector(".threads").insertAdjacentHTML("beforeend", template);

      el.querySelector(".tb-threads h1").textContent = `Threads: ${ongoingThreads} / ${totalThreads}`
    });
  }

  document.addEventListener('DOMContentLoaded', getThreads);
})();

