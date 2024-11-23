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

function onLoaded() {
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
      `?l=${leftInput.value ?? 1}&r=${rightInput.value ?? 5000}&n=${numInput.value}&s=${seedInput.value}`;
    previewButtons.forEach((btn) => {
      btn.disabled = false;
    });
    downloadLinks.forEach((link) => {
      link.href = pdfPath;
      link.classList.remove("disabled");
    });
  };

  inputs.forEach((input) => {
    updateValidity(input);
    update();

    input.addEventListener("input", ({ target }) => {
      updateValidity(target);
      update();
    });
  });

  seedRandomButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      seedInput.value = (Math.floor(Math.random() * 0xffff) + 1).toString(16).toUpperCase().padStart(4, "0");
      updateValidity(seedInput);
      update();
    });
  });

  previewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      previewEmbeds.forEach((embed) => {
        embed.src = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
          window.location.origin + pdfPath
        )}`;
      });
    });
  });

  fetch("/api/books")
    .then((res) => res.json())
    .then((books) => {
      books.forEach((book) => {
        const option = document.createElement("option");
        option.value = book.id;
        option.textContent = book.name;
        bookSelect.appendChild(option);
      });
    })
    .catch(console.error);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onLoaded);
} else {
  onLoaded();
}
