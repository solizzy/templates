(() => {
  async function getThreads() {
    const sheetid = "12zMYRcDGGnV-0bnBYX_p1hJvIROvzkV3UOE5YDuwb7U";
    const queryparameters = "A2:G";
    const apikey = "AIzaSyBmN9-hpKVcVJ5KGgCD_9fXtqRAIIIj9ok";
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
      let [url, title, participants, notes, timeline, status, chara] =
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

      acc[chara][timeline].push({ url, title, participants, notes, status });

      return acc;
    }, {});
  }

  function createLayout(threads) {
    const trackerEl = document.querySelectorAll(".iz-threads");

    trackerEl.forEach((el) => {
      const char = el.dataset.char;

      let ongoingThreads = 0;
      let totalThreads = 0;

      const template = `
    ${Object.entries(threads[char]).map(([title, threads]) => {
        if (threads.length === 0) return "";

        return `<h2>${title}</h2>
          ${threads.map(thread => {
          totalThreads++;
          if (thread.status.toLowerCase() === "ongoing") { ongoingThreads++; }

          return `<thread class="${thread.status.toLowerCase()}" ${thread.notes ? `title="${thread.notes}"` : ``}><a href="${thread.url}">${thread.title}</a> ${thread.participants ? `with ${thread.participants.toLowerCase()}` : ""}</thread>`
        }).join("")}`
      }).join("")
        }`

      el.querySelector(".content").insertAdjacentHTML("beforeend", template);

      el.querySelector(".header").textContent = `${ongoingThreads} / ${totalThreads} threads`
    });
  }

  getThreads();
})();
