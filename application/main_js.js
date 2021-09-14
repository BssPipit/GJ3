var svg_copy =
  "<svg class='svg_icon' version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='561px' height='561px' viewBox='0 0 561 561' style='enable-background:new 0 0 561 561;' xml:space='preserve'><g><g id='content-copy'><path d='M395.25,0h-306c-28.05,0-51,22.95-51,51v357h51V51h306V0z M471.75,102h-280.5c-28.05,0-51,22.95-51,51v357 c0,28.05,22.95,51,51,51h280.5c28.05,0,51-22.95,51-51V153C522.75,124.95,499.8,102,471.75,102z M471.75,510h-280.5V153h280.5V510 z'/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>";

// Disable offline feature
/*
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").then(
      (registration) => {
        console.log("SW Registration was successful", registration);
        // Registration was successful
      },
      (err) => {
        // registration failed :(
        console.log("SW registration failed", err);
      }
    );
  });
}
*/

function search_contact(obj_id) {
  let txt = document.getElementById(obj_id).value;
  contact_display(filter_contact(txt), "search_result", txt);
}

function filter_contact(searchtext = "") {
  let contact_withscore = contact;

  if (searchtext && searchtext.length > 0) {
    contact_withscore.forEach((val, idx) => {
      contact_withscore[idx].score = 0;
    });
    let splittxt = [];
    splittxt = searchtext.trim().split(" ");
    splittxt.forEach((s) => {
      contact_withscore.forEach((c, idx) => {
        let reg = new RegExp(s, "i");
        Object.keys(c).forEach((txt_key) => {
          if (
            typeof c[txt_key] === "string" &&
            c[txt_key].replace(/\-/, "").match(reg)
          ) {
            contact_withscore[idx].score++;
          } else if (Array.isArray(c[txt_key])) {
            const arr_phone = c[txt_key];
            arr_phone.forEach((p) => {
              p.replace(/\-/, "").match(reg) && contact_withscore[idx].score++;
            });
          }
        });
      });
    });
  } else {
    // Display all contact
    contact_withscore.forEach((val, idx) => {
      contact_withscore[idx].score = 1;
    });
  }

  contact_withscore = contact_withscore.filter((c) => c.score > 0);

  let gr_score = [];
  contact_withscore.forEach((val, idx) => {
    if (!gr_score[val["group"]]) {
      gr_score[val["group"]] = 0;
    }

    if (gr_score[val["group"]] < val.score) {
      gr_score[val["group"]] = val.score;
    }
  });
  contact_withscore.forEach((val, idx) => {
    contact_withscore[idx].group_score = gr_score[val.group];
  });
  //console.log(gr_score);

  contact_withscore.sort((a, b) => {
    if (a.group_score === b.group_score) {
      if (a.group.localeCompare(b.group) === 0) {
        return b.score - a.score;
      } else {
        return ("" + a.group).localeCompare(b.group);
      }
    } else {
      return b.group_score - a.group_score;
    }
  });
  // console.log(contact_withscore);
  return contact_withscore;
}

function contact_display(con, container_id, txt_highlight) {
  // txt_highlight is string
  let t = "";
  let prev_group = false;
  // con = contact array of object

  if (con.length === 0 || typeof con !== "object") {
    document.getElementById(container_id).innerHTML = "";
    return false;
  }

  t += "<div class='item_group'>"; // class = item_group
  con.forEach((el) => {
    if (prev_group === false) {
      // first value
      t += "<span class='group_header'>" + escapeHtml(el.group) + "</span>";
      prev_group = el.group;
    } else if (prev_group !== el.group) {
      t += "</div>";
      t += "<div class='item_group'>";
      t += "<span class='group_header'>" + escapeHtml(el.group) + "</span>";
      prev_group = el.group;
    }

    t += "<div class='item_person'>"; // class = item_person
    if (el.name && el.name.length > 0) {
      t += "<span class='person_name'>" + escapeHtml(el.name);
      if (el.nickname && el.nickname.length > 0) {
        t += " " + el.nickname;
      }
      t +=
        " <a onclick='Clipboard.copy(\"" +
        escapeHtml(el.name) +
        " " +
        phone_format(el.phone[0]) +
        "\");'>" +
        svg_copy;
      t += "</a>";

      t += "</span>";
    }

    el.phone.forEach((a) => {
      t += "<span class='person_phone'>";
      t += "<a href='tel:" + phone_format(a) + "'>";
      t += a ? phone_format(a, true) : "";
      t += "</a>";
      t += "</span>";
    });

    if (el.email && el.email.length > 0) {
      t += "<span class='person_email'>";
      t += "<a href='mailto:" + escapeHtml(el.email) + "'>";
      t += el.email;
      t += "</a></span>";
    }
    t += "</div>"; // class = item_person
  });
  t += "</div>"; // class = item_group
  document.getElementById(container_id).innerHTML = t;
}

function phone_format(num, dash = false) {
  if (num === "undefined" || num === null) return num;
  num = num.replace(/\-/, "");
  if (dash) {
    if (num.length === 10) {
      return num.substr(0, 3) + "-" + num.substr(3, 3) + "-" + num.substr(6, 4);
    } else if (num.length === 9) {
      return num.substr(0, 2) + "-" + num.substr(2, 3) + "-" + num.substr(5, 4);
    }
  }
  return num;
}

function escapeHtml(txt) {
  return txt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.Clipboard = (function (window, document, navigator) {
  var textArea, copy;

  function isOS() {
    return navigator.userAgent.match(/ipad|iphone/i);
  }

  function createTextArea(text) {
    textArea = document.createElement("textArea");
    textArea.value = text;
    document.body.appendChild(textArea);
  }

  function selectText() {
    var range, selection;

    if (isOS()) {
      range = document.createRange();
      range.selectNodeContents(textArea);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }
  }

  function copyToClipboard() {
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  copy = function (text) {
    createTextArea(text);
    selectText();
    copyToClipboard();
  };

  return { copy };
})(window, document, navigator);
