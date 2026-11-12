if (!window.jQuery) {
  const status = document.querySelector("#jqueryLoadStatus");

  if (status) {
    status.textContent =
      "Could not load jQuery. Check your internet connection.";
  }
} else {
  $(function () {
    const dataUrl = "./data/assignments.json";
    const $list = $("#jqueryAssignmentList");
    const $status = $("#jqueryLoadStatus");
    const $toast = $("#jqueryToast");

    const requiredIds = [
      "jqueryAssignmentList",
      "jqueryLoadStatus",
      "jqueryToast",
      "jquerySearch",
      "jqueryStatusFilter",
      "jqueryAssignmentEmpty",
      "runSelectors",
      "runDomMethods",
      "runTraversal",
      "toggleDelegated",
      "oneTimeAction",
      "jqueryDemoForm",
      "runAjax",
      "runPostExample",
      "effectsBox",
      "jquerySaveDemo",
      "vanillaSaveDemo",
      "migrationMessage"
    ];

    const missingIds = requiredIds.filter(
      (id) => !document.getElementById(id)
    );

    if (missingIds.length) {
      $status.text(
        `Missing required page elements: ${missingIds.join(", ")}`
      );
      return;
    }

    let allAssignments = [];
    let delegatedEnabled = true;

    // Display a temporary notification.
    function toast(message, type = "success") {
      const $message = $("<div>")
        .addClass(
          `toast${type === "error" ? " toast-error" : ""}`
        )
        .text(message);

      $toast.append($message);

      setTimeout(() => {
        $message.fadeOut(180, function () {
          $(this).remove();
        });
      }, 2800);
    }

    // Validate JSON assignment records before rendering.
    function normaliseAssignments(records) {
      if (!Array.isArray(records)) return [];

      const validStatuses = [
        "Pending",
        "In Progress",
        "Completed"
      ];

      return records
        .filter((item) => (
          item &&
          typeof item === "object" &&
          !Array.isArray(item)
        ))
        .map((item, index) => ({
          id: String(
            item.id ?? `assignment-${index + 1}`
          ),

          title:
            typeof item.title === "string" && item.title.trim()
              ? item.title.trim()
              : "Untitled assignment",

          description:
            typeof item.description === "string"
              ? item.description
              : "No description provided.",

          category:
            typeof item.category === "string" && item.category.trim()
              ? item.category.trim()
              : "General",

          status: validStatuses.includes(item.status)
            ? item.status
            : "Pending",

          dueDate:
            typeof item.dueDate === "string"
              ? item.dueDate
              : "No due date",

          progress: Number.isFinite(Number(item.progress))
            ? Math.max(
                0,
                Math.min(100, Number(item.progress))
              )
            : 0
        }));
    }

    // Render assignment cards using jQuery.
    // Vanilla version uses fetch(), createElement() and textContent.
    function renderAssignments(items) {
      const cards = items.map((item) => {
        const statusClass = item.status
          .toLowerCase()
          .replaceAll(" ", "-");

        const $card = $("<article>")
          .addClass(
            "section-card assignment-card jquery-assignment"
          )
          .attr("data-id", item.id);

        const $top = $("<div>")
          .addClass("card-topline");

        const $category = $("<span>")
          .addClass("eyebrow")
          .text(item.category);

        const $badge = $("<span>")
          .addClass(`status-badge status-${statusClass}`)
          .text(item.status);

        $top.append($category, $badge);

        const $title = $("<h3>")
          .text(item.title);

        const $description = $("<p>")
          .addClass("muted small jquery-description")
          .text(item.description);

        const $meta = $("<p>")
          .addClass("muted small")
          .text(
            `${item.dueDate} · ${item.progress}% complete`
          );

        const $button = $("<button>", {
          type: "button",
          class: "secondary-button details-button jquery-details",
          text: "View details"
        }).attr("data-id", item.id);

        $card.append(
          $top,
          $title,
          $description,
          $meta,
          $button
        );

        return $card[0];
      });

      $list.empty().append(cards);

      // each() performs an action on every jQuery collection item.
      $list.children(".jquery-assignment").each(function (index) {
        $(this).attr("data-index", index);
      });
    }

    // Search and filter assignments.
    function filterAssignments() {
      const query = String(
        $("#jquerySearch").val() ?? ""
      )
        .trim()
        .toLowerCase();

      const selectedStatus =
        $("#jqueryStatusFilter").val();

      const visible = allAssignments.filter((item) => {
        const matchesText =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);

        const matchesStatus =
          selectedStatus === "all" ||
          item.status === selectedStatus;

        return matchesText && matchesStatus;
      });

      renderAssignments(visible);

      $("#jqueryAssignmentEmpty").prop(
        "hidden",
        visible.length !== 0
      );
    }

    // Load JSON using $.ajax().
    // Demonstrates success, error, complete and jqXHR methods.
    function loadAssignments() {
      $status.text("Loading assignments…");

      $("#ajaxOutput").text("Request in progress…");

      const request = $.ajax({
        url: dataUrl,
        method: "GET",
        dataType: "json",

        success(data) {
          if (!data || !Array.isArray(data.assignments)) {
            allAssignments = [];

            renderAssignments([]);

            $("#jqueryAssignmentEmpty").prop(
              "hidden",
              false
            );

            $status.text("Assignment data is invalid.");

            $("#ajaxOutput").text(
              "The response must contain an assignments array."
            );

            return;
          }

          allAssignments = normaliseAssignments(
            data.assignments
          );

          filterAssignments();

          $status.text(
            `${allAssignments.length} assignments loaded.`
          );

          $("#ajaxOutput").text(
            `Success callback: ${allAssignments.length} records loaded.`
          );
        },

        error(xhr, textStatus) {
          allAssignments = [];

          renderAssignments([]);

          $("#jqueryAssignmentEmpty").prop(
            "hidden",
            false
          );

          $status.text(
            `Could not load assignments (HTTP ${xhr.status}).`
          );

          $("#ajaxOutput").text(
            `Error callback: ${textStatus}, HTTP ${xhr.status}.`
          );

          toast("Could not load assignment data.", "error");
        },

        complete() {
          $("#ajaxOutput").append(
            " Complete callback executed."
          );
        }
      });

      request
        .done(() => {
          $("#ajaxOutput").append(" done() executed.");
        })
        .fail(() => {
          $("#ajaxOutput").append(" fail() executed.");
        })
        .always(() => {
          $("#ajaxOutput").append(" always() executed.");
        });

      return request;
    }

    // Initial AJAX request.
    loadAssignments();

    // Cache frequently used controls.
    const $search = $("#jquerySearch");
    const $filter = $("#jqueryStatusFilter");

    $search.on("input", filterAssignments);

    $filter.on("change", filterAssignments);

    $("#jqueryClearFilters").on("click", function () {
      $search.val("");
      $filter.val("all");

      filterAssignments();
    });

    $("#reloadWithAjax, #runAjax").on(
      "click",
      loadAssignments
    );

    // Element, class, ID, attribute, descendant, child and form selectors.
    $("#runSelectors").on("click", function (event) {
      const results = [
        `Element: ${$("p").length}`,
        `Class: ${$(".section-card").length}`,
        `ID: ${$("#jqueryDomDemo").length}`,
        `Attribute: ${$("[data-demo]").length}`,
        `Descendant: ${$(".demo-box p").length}`,
        `Child: ${$(".demo-box > h3").length}`,
        `Form controls: ${$("#jqueryDemoForm :input").length}`,
        `Event: ${event.type}`
      ];

      $("#selectorOutput").text(
        results.join(" · ")
      );
    });

    // DOM manipulation and class manipulation.
    $("#runDomMethods").on("click", function () {
      const $demo = $("#jqueryDomDemo");
      const $zone = $("#insertionZone");

      // Reset the playground so the test can be repeated.
      $zone.empty().append(
        $("<span>")
          .attr("id", "replaceTarget")
          .text("Current status")
      );

      $("#domTitle").text("Profile updated");

      // html() is used only with fixed, trusted demonstration markup.
      $(".demo-desc").html(
        "Your <strong>profile</strong> details are ready."
      );

      $("#domInput").val("Updated value");

      $demo.attr("data-demo", "updated");

      $("#domCheckbox").prop("checked", true);

      $demo.data("example", "saved with data()");

      $demo.css(
        "border-color",
        "var(--accent)"
      );

      const $title = $("#domTitle");

      $title.addClass("highlight");

      const hasClass =
        $title.hasClass("highlight");

      $title
        .removeClass("highlight")
        .toggleClass("highlight");

      // append(), prepend(), before() and after().
      $zone.prepend(
        $("<span>")
          .addClass("inserted")
          .text("First · ")
      );

      $zone.append(
        $("<span>")
          .addClass("inserted")
          .text(" · Last")
      );

      $("#replaceTarget").before(
        $("<span>").text("Before · ")
      );

      $("#replaceTarget").after(
        $("<span>").text(" · After")
      );

      // clone() creates an independent copy.
      const $clone = $("#replaceTarget")
        .clone()
        .text("Cloned status");

      $zone.append($clone);

      // replaceWith() replaces the original element.
      $("#replaceTarget").replaceWith(
        $("<span>").text("Replaced status")
      );

      // empty() removes contents and remove() removes the element.
      const $temporary = $("<span>")
        .text("Temporary element")
        .appendTo($zone);

      $temporary.empty().remove();

      $("#domOutput").text(
        `DOM methods executed. ` +
        `data(): ${$demo.data("example")}; ` +
        `hasClass(): ${hasClass}.`
      );
    });

    // Traversal methods on dynamically created assignment cards.
    $("#runTraversal").on("click", function () {
      const $cards = $(".jquery-assignment");

      const $first = $cards.first();

      const $second = $cards.eq(1);

      if (!$first.length) {
        $("#traversalOutput").text(
          "No assignment cards are loaded."
        );

        return;
      }

      const results = {
        parent: $first.parent().length,

        parents: $first.parents("main").length,

        children: $first.children().length,

        find: $first.find("h3").length,

        closest: $first
          .find("h3")
          .closest("article").length,

        siblings: $first
          .siblings(".jquery-assignment").length,

        next: $first
          .next(".jquery-assignment").length,

        prev: $second
          .prev(".jquery-assignment").length,

        first: $cards.first().length,

        last: $cards.last().length,

        eq: $cards.eq(1).length
      };

      $("#traversalOutput").text(
        Object.entries(results)
          .map(([name, value]) => `${name}(): ${value}`)
          .join(" · ")
      );
    });

    // Delegated event handler for dynamic assignment buttons.
    function detailHandler(event) {
      event.preventDefault();

      const $card = $(event.currentTarget)
        .closest(".jquery-assignment");

      const $dialog = $("<dialog>")
        .addClass("modal jquery-modal")
        .attr(
          "aria-labelledby",
          "jqueryDialogTitle"
        );

      const $title = $("<h2>", {
        id: "jqueryDialogTitle",
        text: $card.find("h3").first().text()
      });

      const $description = $("<p>").text(
        $card.find(".jquery-description").text()
      );

      const $close = $("<button>", {
        type: "button",
        class: "secondary-button",
        text: "Close"
      });

      $dialog
        .append($title, $description, $close)
        .appendTo("body");

      $close.on("click", () => {
        $dialog[0].close();
      });

      // Remove the modal after Close or Escape.
      $dialog.one("close", function () {
        $(this).remove();
      });

      // Close when the dialog backdrop is clicked.
      $dialog.on("click", function (closeEvent) {
        if (closeEvent.target === this) {
          this.close();
        }
      });

      $dialog[0].showModal();
    }

    $list.on(
      "click",
      ".jquery-details",
      detailHandler
    );

    // off() removes the delegated event; on() restores it.
    $("#toggleDelegated").on("click", function () {
      if (delegatedEnabled) {
        $list.off(
          "click",
          ".jquery-details",
          detailHandler
        );

        delegatedEnabled = false;

        $(this).text("Enable card details");

      } else {
        $list.on(
          "click",
          ".jquery-details",
          detailHandler
        );

        delegatedEnabled = true;

        $(this).text("Disable card details");
      }
    });

    // one() executes this event handler only once.
    $("#oneTimeAction").one(
      "click",
      function (event) {
        $("#eventOutput").text(
          `One-time ${event.type} event executed.`
        );
      }
    );

    // Form values, validation, serialize and serializeArray.
    $("#jqueryDemoForm").on("submit", function (event) {
      event.preventDefault();

      if (!this.reportValidity()) return;

      const $form = $(this);

      const name = String(
        $form.find("[name='name']").val() ?? ""
      ).trim();

      const serialized = $form.serialize();

      const fields = $form.serializeArray();

      if (!name) {
        $("#formOutput").text(
          "Please enter your name."
        );

        return;
      }

      $("#formOutput").text(
        `${name}: ${serialized} | ${JSON.stringify(fields)}`
      );
    });

    // $.get() retrieves the JSON response as text.
    $("#loadWithGet").on("click", function () {
      $.get(
        dataUrl,
        null,
        (text) => {
          try {
            const data = JSON.parse(text);

            const count = Array.isArray(data.assignments)
              ? data.assignments.length
              : 0;

            $("#ajaxOutput").text(
              `$.get(): ${count} assignment records loaded.`
            );

          } catch {
            $("#ajaxOutput").text(
              "$.get(): invalid JSON response."
            );
          }
        },
        "text"
      ).fail((xhr) => {
        $("#ajaxOutput").text(
          `$.get() failed: HTTP ${xhr.status}.`
        );
      });
    });

    // $.getJSON() parses the response as JSON.
    $("#loadWithGetJSON").on("click", function () {
      $.getJSON(dataUrl)
        .done((data) => {
          const count = Array.isArray(data.assignments)
            ? data.assignments.length
            : 0;

          $("#ajaxOutput").text(
            `$.getJSON(): ${count} assignment records loaded.`
          );
        })
        .fail((xhr) => {
          $("#ajaxOutput").text(
            `$.getJSON() failed: HTTP ${xhr.status}.`
          );
        })
        .always(() => {
          $("#ajaxOutput").append(
            " Request finished."
          );
        });
    });

    // $.post() is a real request.
    // The Python static server does not support POST,
    // so an HTTP 501 response is expected.
    $("#runPostExample").on("click", function () {
      $("#postExample").prop("hidden", false);

      $("#ajaxOutput").text("Sending POST request…");

      $.post(
        dataUrl,
        { title: "Example assignment" }
      )
        .done(() => {
          $("#ajaxOutput").text(
            "POST request succeeded."
          );
        })
        .fail((xhr) => {
          $("#ajaxOutput").text(
            `POST request failed with HTTP ${xhr.status}. ` +
            "This is expected because the Python static server has no POST endpoint."
          );
        })
        .always(() => {
          $("#ajaxOutput").append(
            " $.post() always finished."
          );
        });
    });

    // jQuery effects and chaining.
    $("#effectShow").on("click", () => {
      $("#effectsBox").show();
    });

    $("#effectHide").on("click", () => {
      $("#effectsBox").hide();
    });

    $("#effectToggle").on("click", () => {
      $("#effectsBox").toggle();
    });

    $("#effectFade").on("click", () => {
      $("#effectsBox")
        .stop(true, true)
        .fadeOut(150)
        .fadeIn(150);
    });

    $("#effectSlide").on("click", () => {
      $("#effectsBox")
        .stop(true, true)
        .slideUp(150)
        .slideDown(150);
    });

    $("#effectAnimate").on("click", () => {
      $("#effectsBox")
        .stop(true, true)
        .animate(
          { opacity: 0.6, marginLeft: "12px" },
          150
        )
        .animate(
          { opacity: 1, marginLeft: "0px" },
          150
        );
    });

    // jQuery version of the save action.
    $("#jquerySaveDemo").on("click", function () {
      $("#migrationMessage").text(
        "Saved with jQuery."
      );
    });

    // Equivalent Vanilla JavaScript implementation.
    document
      .querySelector("#vanillaSaveDemo")
      ?.addEventListener("click", () => {
        const message =
          document.querySelector("#migrationMessage");

        if (message) {
          message.textContent =
            "Saved with Vanilla JavaScript.";
        }
      });
  });
}
