// SPDX-License-Identifier: MIT
// Copyright (c) 2024 TwoSquirrels

"use strict";

function updateValidity(elm) {
  if (elm.checkValidity()) {
    elm.classList.remove("is-invalid");
    return true;
  } else {
    elm.classList.add("is-invalid");
    return false;
  }
}

const externalIcon = document.createElement("i");
externalIcon.classList.add("bi", "bi-box-arrow-up-right", "mb-2");
externalIcon.setAttribute("aria-hidden", "true");

const books = fetch("/api/books").then((res) => res.json());

async function onLoaded() {
  const form = document.querySelector("form#enwords-form");
  const inputs = form.querySelectorAll("input,select,textarea");
  const bookSelect = form.querySelector("select#enwords-book");
  const leftInput = form.querySelector("input#enwords-left");
  const rightInput = form.querySelector("input#enwords-right");
  const numInput = form.querySelector("input#enwords-num");
  const seedInput = form.querySelector("input#enwords-seed");
  const seedRandomButtons = form.querySelectorAll("button.enwords-seed-random");
  const previewButtons = form.querySelectorAll("button.enwords-generate-preview");
  const downloadLinks = form.querySelectorAll("a.enwords-download");
  const previewEmbeds = document.querySelectorAll("embed.enwords-preview");
  const booksList = document.querySelector("div#enwords-books");

  let pdfPath = "";

  const update = () => {
    const validity = form.checkValidity();

    if (!validity) {
      previewButtons.forEach((btn) => {
        btn.disabled = true;
      });
      downloadLinks.forEach((link) => {
        link.classList.add("disabled");
      });
      return;
    }

    pdfPath =
      `/api/pdf/${bookSelect.value}` +
      `?l=${leftInput.value ?? 1}&r=${rightInput.value ?? 5000}&n=${numInput.value ?? 50}&s=${seedInput.value}`;
    previewButtons.forEach((btn) => {
      btn.disabled = false;
    });
    downloadLinks.forEach((link) => {
      link.href = pdfPath;
      link.classList.remove("disabled");
    });
  };

  const randomSeedStr = () => (Math.floor(Math.random() * 0xffff) + 1).toString(16).toUpperCase().padStart(4, "0");

  seedRandomButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      seedInput.value = randomSeedStr();
      updateValidity(seedInput);
      update();
    });
  });

  seedInput.value = randomSeedStr();

  inputs.forEach((input) => {
    updateValidity(input);

    input.addEventListener("input", ({ target }) => {
      updateValidity(target);
      update();
    });
  });

  update();

  previewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      previewEmbeds.forEach((embed) => {
        embed.src = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
          window.location.origin + pdfPath
        )}`;
      });
    });
  });

  const nextBooksList = booksList.cloneNode(false);
  for (const { id, name, amazon } of await books) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    bookSelect.appendChild(option);

    if (!amazon) continue;

    const cardWrapper = document.createElement("div");
    cardWrapper.classList.add("col-md-6", "p-1");
    cardWrapper.appendChild(
      (() => {
        const card = document.createElement("div");
        card.classList.add("card", "display-relative");
        card.appendChild(
          (() => {
            const link = document.createElement("a");
            link.classList.add("card-body", "stretched-link", "icon-link", "justify-content-between");
            link.href = amazon;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = name;
            link.appendChild(externalIcon.cloneNode());
            return link;
          })()
        );
        return card;
      })()
    );
    nextBooksList.appendChild(cardWrapper);
  }
  booksList.replaceWith(nextBooksList);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ({}) => onLoaded().catch(console.error));
} else {
  onLoaded().catch(console.error);
}
