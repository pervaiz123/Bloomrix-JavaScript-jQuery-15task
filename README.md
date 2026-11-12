
# Assignment 15 — jQuery + Vanilla JavaScript Comparison

A small internship portal implemented first with Vanilla JavaScript, plus a separate jQuery comparison lab.

No JavaScript framework is used.

## Run

Open a terminal in the project folder:

```bash
python -m http.server 5500
```

Open:

Vanilla portal:
http://localhost:5500/

jQuery comparison:
http://localhost:5500/jquery-lab.html

The jQuery lab loads jQuery 3.7.1 from the official code.jquery.com CDN, so an internet connection is needed for that page.

## Project files

- index.html: Main Vanilla JavaScript internship portal.
- jquery-lab.html: Separate jQuery practice and comparison page.
- styles.css: Shared responsive styling.
- data/assignments.json: Assignment data used by both versions.
- js/constants.js: Shared application constants.
- js/api.js: Fetches and validates local JSON.
- js/storage.js: Saves theme preference in localStorage.
- js/utils.js: Search, filtering, date formatting and URL helpers.
- js/vanilla.js: Vanilla assignment cards, navigation, form, modal and notifications.
- js/app.js: Starts the Vanilla portal.
- js/jquery-lab.js: jQuery implementation and method demonstrations.

## Vanilla JavaScript portal

- Navigation and profile.
- Dynamic assignment list.
- Assignment search and status filtering.
- Application form using FormData.
- Assignment details modal.
- Status badges and notifications.
- Theme preference in localStorage.
- Fetch and JSON validation.
- Safe rendering using createElement() and textContent.
- Event delegation.
- Debounced search.
- URLSearchParams and History API.

## jQuery comparison lab

- CDN loading and $(function() {}).
- Element, class, ID, attribute, descendant, child and form selectors.
- text(), html(), val(), attr(), prop(), data() and css().
- addClass(), removeClass(), toggleClass() and hasClass().
- append(), prepend(), before(), after(), remove(), empty() and clone().
- replaceWith() for replacing an element.
- parent(), parents(), children(), find(), closest(), siblings(), next(), prev(), first(), last() and eq().
- on(), off(), one() and event delegation.
- Event object and preventDefault().
- Form val(), serialize() and serializeArray().
- Form validation.
- $.ajax(), $.get(), $.post() and $.getJSON().
- success, error and complete callbacks.
- jqXHR, done(), fail() and always().
- show(), hide(), toggle(), fadeIn(), fadeOut(), slideUp(), slideDown() and animate().
- Method chaining and each().
- jQuery versus native forEach() and map().
- jQuery-to-Vanilla migration example.
- Plugin and legacy-code guidance.

## AJAX

The project loads the same local JSON resource in both versions.

Python's static HTTP server supports GET requests but does not implement an application POST endpoint.

The $.post() example is provided for learning and is not submitted to a fake endpoint.

## Security

- API data is inserted as text rather than untrusted HTML.
- The jQuery html() demonstration uses fixed trusted content.
- Avoid unsafe innerHTML and html() with external data.
- Do not expose private API keys or secrets in frontend code.
- Validate data before rendering.
- Server-side validation is still required in production applications.

## Common jQuery mistakes

- Repeating unnecessary DOM queries.
- Registering duplicate event handlers.
- Forgetting to remove old handlers.
- Using animations without a purpose.
- Using too much inline styling.
- Installing plugins when native browser APIs are sufficient.

## DevTools testing

### Console
Inspect JavaScript errors and execution.

### Network
Check assignments.json and script requests.

### Application
Inspect the skillpath15-theme localStorage value.

### Sources
Set breakpoints inside renderAssignments() or the AJAX success callback.

### Performance
Record a reload and inspect scripting and rendering.

## Browser testing checklist

1. Open the Vanilla portal.
2. Verify profile and assignment data.
3. Search for JavaScript.
4. Filter by Completed and Pending.
5. Open and close an assignment modal.
6. Submit the application form with valid values.
7. Change the theme and reload.
8. Mark notifications as read.
9. Open the jQuery comparison page.
10. Verify jQuery assignment cards load.
11. Run selector demonstrations.
12. Run DOM manipulation demonstrations.
13. Run traversal demonstrations.
14. Test delegated events and one-time events.
15. Submit the jQuery form.
16. Test $.ajax(), $.get() and $.getJSON().
17. Inspect the $.post() learning example.
18. Test all jQuery effects.
19. Compare the Vanilla and jQuery implementations.
20. Check the browser Console and Network tabs.

## jQuery and Vanilla JavaScript

jQuery remains useful when maintaining existing applications, CMS themes and plugins.

Vanilla JavaScript is sufficient for many modern browser features, including DOM selection, events, Fetch API, forms and localStorage.

Use jQuery where an existing application depends on it. Avoid adding it unnecessarily to new applications.
