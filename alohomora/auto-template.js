// ==UserScript==
// @name         Post-ify! (Alohomora)
// @namespace    http://isabroch.dk
// @version      0.1
// @description  Inject a button to wrap text into posts!
// @author       Izzy
// @match        http*://xalohomorax.jcink.net/*
// @icon         https://www.google.com/s2/favicons?domain=jcink.net
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  if (document.getElementById("posting-form")) {
    postTemplateButtons()
  }

})();

function postTemplateButtons() {
  const container = $("[name='preview']").parent();

  function getCharacter() {
    // not used currently
    return (
      $("#post_as_menu").attr("value") === "0"
        ? $("#logged-in-as").text().trim().split(" ")[0]
        : $("#post_as_menu option:selected").text().trim().split(" ")[1]
    ).toLowerCase();
  }

  function templateify() {
    const character = $("#logged-in-as").text().trim();

    const tags = (() => {
      const postedBy = $("#topic-summary tr:nth-child(2n-1) b");

      let tags = new Set();

      postedBy.each(function () {
        const text = $(this).text();
        if (!text.match(new RegExp(`\\b${character}\\b`, "gi"))) {
          tags.add(`@[${text}]`);
        }
      })

      if (tags.size === 0) return "@[tag]"

      return [...tags].join(" ");
    })();

    const textArea = document.querySelector(".textinput");

    const ooc = (() => textArea.value.match(/\/\/ (.*)/i)?.[1] )();

    textArea.value = `[default]${textArea.value
      .replace(/\*\*\*(.*?)\*\*\*/gi, `[b][i]$1[/i][/b]`) /* bold italics */
      .replace(/\*\*(.*?)\*\*/gi, `[b]$1[/b]`) /* bold */
      .replace(/\*(.*?)\*/gi, `[i]$1[/i]`) /* italics */
      .replace(/\_(.*?)\_/gi, `[u]$1[/u]`) /* underline */
      .replace(/\[(\d+d\d+([+-]\d+)?)\]/gi, `[roll]$1[/roll]`) /* dice roll */
      .replace(/\/\/(.*)/gi, ``) /* ooc notes */
      .trim()}\n\n[dohtml]<hr>[/dohtml]\n${tags}${ooc ? `\n\n${ooc}` : ''}[/default]`;
  }

  container.append(`<input type="button" class="forminput" name="iz-templateify" value="Template-ify!" style="background: #dc6a6a">`)

  $("[name=iz-templateify]").click(() => templateify())
}
