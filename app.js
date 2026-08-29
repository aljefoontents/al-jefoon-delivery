/* =========================================================
   AL JEFOON TENTS
   DELIVERY MANAGEMENT SYSTEM
   LOCAL VERSION — SUPABASE REMOVED
========================================================= */


/* =========================================================
   APPLICATION STORAGE
========================================================= */

const STORAGE_KEY =
  "alJefoonDeliveriesV1";

const DARK_MODE_KEY =
  "alJefoonDeliveryDarkMode";


/* =========================================================
   APPLICATION STATE
========================================================= */

let deliveries = [];

let editingId = null;


/* =========================================================
   HELPERS
========================================================= */

const $ = id =>
  document.getElementById(id);


const views = {
  dashboard: $("dashboardView"),
  deliveries: $("deliveriesView"),
  new: $("newView")
};


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value = "") {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );
}


/* =========================================================
   DARK MODE
========================================================= */

function applyDarkMode() {

  const enabled =
    localStorage.getItem(
      DARK_MODE_KEY
    ) === "true";


  document.body.classList.toggle(
    "dark-mode",
    enabled
  );


  const button =
    $("darkModeToggle");

  const text =
    $("themeToggleText");

  const icon =
    $("themeToggleIcon");


  if (enabled) {

    if (text) {
      text.textContent =
        "Light Mode";
    }

    if (icon) {
      icon.textContent =
        "☀";
    }

    if (button) {
      button.setAttribute(
        "aria-label",
        "Switch to light mode"
      );
    }

  } else {

    if (text) {
      text.textContent =
        "Dark Mode";
    }

    if (icon) {
      icon.textContent =
        "☾";
    }

    if (button) {
      button.setAttribute(
        "aria-label",
        "Switch to dark mode"
      );
    }
  }
}


function toggleDarkMode() {

  const current =
    localStorage.getItem(
      DARK_MODE_KEY
    ) === "true";


  localStorage.setItem(
    DARK_MODE_KEY,
    String(!current)
  );


  applyDarkMode();
}


/* =========================================================
   LOAD LOCAL DELIVERIES
========================================================= */

function loadDeliveries() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {

      deliveries = [];

      return;
    }


    const data =
      JSON.parse(saved);


    deliveries =
      Array.isArray(data)
        ? data
        : [];


  } catch (error) {

    console.error(
      "Load deliveries error:",
      error
    );

    deliveries = [];

    toast(
      "Unable to load saved deliveries."
    );
  }
}


/* =========================================================
   SAVE LOCAL DELIVERIES
========================================================= */

function saveLocalData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        deliveries
      )
    );

    return true;

  } catch (error) {

    console.error(
      "Storage error:",
      error
    );

    toast(
      "Unable to save delivery data."
    );

    return false;
  }
}


/* =========================================================
   NORMALIZE DELIVERY
========================================================= */

function normalizeDelivery(d) {

  return {

    id:
      d.id,

    reference:
      d.reference_number ||
      d.reference ||
      "",

    date:
      d.delivery_date ||
      d.date ||
      "",

    status:
      d.status ||
      "Pending",

    customer:
      d.customer_name ||
      d.customer ||
      "",

    phone:
      d.phone ||
      "",

    address:
      d.address ||
      "",

    driver:
      d.driver ||
      "",

    vehicle:
      d.vehicle ||
      "",

    expected_time:
      d.expected_time ||
      "",

    items:
      d.items ||
      "",

    notes:
      d.notes ||
      "",

    created_at:
      d.created_at ||
      null,

    updated_at:
      d.updated_at ||
      null
  };
}


/* =========================================================
   GENERATE REFERENCE
========================================================= */

function nextRef() {

  const year =
    new Date()
      .getFullYear();


  let highest =
    0;


  deliveries.forEach(
    delivery => {

      const d =
        normalizeDelivery(
          delivery
        );


      const match =
        String(
          d.reference
        ).match(
          /^AJT-DEL-(\d{4})-(\d+)$/
        );


      if (
        match &&
        Number(match[1]) === year
      ) {

        const number =
          parseInt(
            match[2],
            10
          );


        if (
          Number.isFinite(number) &&
          number > highest
        ) {

          highest =
            number;
        }
      }
    }
  );


  return (
    `AJT-DEL-${year}-${String(
      highest + 1
    ).padStart(4, "0")}`
  );
}


/* =========================================================
   SAVE DELIVERY
========================================================= */

function saveDelivery(formData) {

  const now =
    new Date().toISOString();


  try {

    if (editingId) {

      const index =
        deliveries.findIndex(
          d =>
            d.id ===
            editingId
        );


      if (index === -1) {

        toast(
          "Delivery could not be found."
        );

        return false;
      }


      const existing =
        normalizeDelivery(
          deliveries[index]
        );


      deliveries[index] = {

        id:
          existing.id,

        reference_number:
          existing.reference,

        delivery_date:
          formData.date,

        status:
          formData.status,

        customer_name:
          formData.customer,

        phone:
          formData.phone ||
          "",

        address:
          formData.address ||
          "",

        driver:
          formData.driver ||
          "",

        vehicle:
          formData.vehicle ||
          "",

        expected_time:
          formData.expected_time ||
          "",

        items:
          formData.items ||
          "",

        notes:
          formData.notes ||
          "",

        created_at:
          existing.created_at ||
          now,

        updated_at:
          now
      };


      if (!saveLocalData()) {
        return false;
      }


      toast(
        "Delivery updated successfully."
      );

    } else {

      const reference =
        nextRef();


      const delivery = {

        id:
          generateId(),

        reference_number:
          reference,

        delivery_date:
          formData.date,

        status:
          formData.status,

        customer_name:
          formData.customer,

        phone:
          formData.phone ||
          "",

        address:
          formData.address ||
          "",

        driver:
          formData.driver ||
          "",

        vehicle:
          formData.vehicle ||
          "",

        expected_time:
          formData.expected_time ||
          "",

        items:
          formData.items ||
          "",

        notes:
          formData.notes ||
          "",

        created_at:
          now,

        updated_at:
          now
      };


      deliveries.unshift(
        delivery
      );


      if (!saveLocalData()) {
        return false;
      }


      toast(
        `Delivery ${reference} saved successfully.`
      );
    }


    return true;


  } catch (error) {

    console.error(
      "Save delivery error:",
      error
    );


    toast(
      "Unable to save delivery."
    );


    return false;
  }
}


/* =========================================================
   GENERATE UNIQUE ID
========================================================= */

function generateId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );
}


/* =========================================================
   DELETE DELIVERY
========================================================= */

function deleteDelivery(id) {

  const raw =
    deliveries.find(
      d =>
        d.id === id
    );


  if (!raw) {
    return;
  }


  const d =
    normalizeDelivery(
      raw
    );


  if (
    !confirm(
      `Delete delivery ${d.reference}?`
    )
  ) {
    return;
  }


  deliveries =
    deliveries.filter(
      item =>
        item.id !== id
    );


  if (!saveLocalData()) {
    return;
  }


  renderTable();

  renderDashboard();


  toast(
    "Delivery deleted successfully."
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function badge(status) {

  let className =
    "pending";


  if (
    status ===
    "Out for Delivery"
  ) {

    className =
      "out";

  } else if (
    status ===
    "Delivered"
  ) {

    className =
      "delivered";

  } else if (
    status ===
    "Cancelled"
  ) {

    className =
      "cancelled";
  }


  return `

    <span class="badge ${className}">
      ${escapeHtml(
        status ||
        "Pending"
      )}
    </span>

  `;
}


/* =========================================================
   SHOW VIEW
========================================================= */

function showView(name) {

  if (!views[name]) {
    return;
  }


  Object.values(views)
    .forEach(
      view =>
        view.classList.add(
          "hidden"
        )
    );


  views[name]
    .classList.remove(
      "hidden"
    );


  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.view ===
          name
        );
      }
    );


  const titles = {

    dashboard: [
      "Dashboard",
      "Track deliveries, drivers and delivery status."
    ],

    deliveries: [
      "Deliveries",
      "Search, edit, print or delete delivery records."
    ],

    new: [
      editingId
        ? "Edit Delivery"
        : "New Delivery",

      "Create and manage delivery information."
    ]
  };


  if ($("pageTitle")) {

    $("pageTitle")
      .textContent =
      titles[name][0];
  }


  if ($("pageSubtitle")) {

    $("pageSubtitle")
      .textContent =
      titles[name][1];
  }


  if (
    name ===
    "dashboard"
  ) {

    renderDashboard();
  }


  if (
    name ===
    "deliveries"
  ) {

    renderTable();
  }
}


/* =========================================================
   OPEN NEW DELIVERY
========================================================= */

function openNew() {

  editingId =
    null;


  const form =
    $("deliveryForm");


  if (form) {
    form.reset();
  }


  if ($("editingId")) {

    $("editingId")
      .value = "";
  }


  if ($("deliveryDate")) {

    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    $("deliveryDate")
      .value =
      today;
  }


  if ($("status")) {

    $("status")
      .value =
      "Pending";
  }


  if ($("formTitle")) {

    $("formTitle")
      .textContent =
      "Create New Delivery";
  }


  if ($("refPreview")) {

    $("refPreview")
      .textContent =
      nextRef();
  }


  showView(
    "new"
  );
}


/* =========================================================
   EDIT DELIVERY
========================================================= */

function editDelivery(id) {

  const raw =
    deliveries.find(
      d =>
        d.id === id
    );


  if (!raw) {
    return;
  }


  const d =
    normalizeDelivery(
      raw
    );


  editingId =
    id;


  if ($("editingId")) {

    $("editingId")
      .value =
      id;
  }


  if ($("formTitle")) {

    $("formTitle")
      .textContent =
      "Edit Delivery";
  }


  if ($("refPreview")) {

    $("refPreview")
      .textContent =
      d.reference ||
      "Delivery";
  }


  if ($("deliveryDate")) {

    $("deliveryDate")
      .value =
      d.date || "";
  }


  if ($("status")) {

    $("status")
      .value =
      d.status ||
      "Pending";
  }


  if ($("customer")) {

    $("customer")
      .value =
      d.customer || "";
  }


  if ($("phone")) {

    $("phone")
      .value =
      d.phone || "";
  }


  if ($("address")) {

    $("address")
      .value =
      d.address || "";
  }


  if ($("driver")) {

    $("driver")
      .value =
      d.driver || "";
  }


  if ($("vehicle")) {

    $("vehicle")
      .value =
      d.vehicle || "";
  }


  if ($("expectedTime")) {

    $("expectedTime")
      .value =
      d.expected_time ||
      "";
  }


  if ($("items")) {

    $("items")
      .value =
      d.items || "";
  }


  if ($("notes")) {

    $("notes")
      .value =
      d.notes || "";
  }


  showView(
    "new"
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const normalized =
    deliveries.map(
      normalizeDelivery
    );


  const total =
    normalized.length;


  const pending =
    normalized.filter(
      d =>
        d.status ===
        "Pending"
    ).length;


  const out =
    normalized.filter(
      d =>
        d.status ===
        "Out for Delivery"
    ).length;


  const delivered =
    normalized.filter(
      d =>
        d.status ===
        "Delivered"
    ).length;


  if ($("statTotal")) {

    $("statTotal")
      .textContent =
      total;
  }


  if ($("statPending")) {

    $("statPending")
      .textContent =
      pending;
  }


  if ($("statOut")) {

    $("statOut")
      .textContent =
      out;
  }


  if ($("statDelivered")) {

    $("statDelivered")
      .textContent =
      delivered;
  }


  const recent =
    normalized
      .slice()
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )
      .slice(
        0,
        8
      );


  if ($("recentTable")) {

    $("recentTable")
      .innerHTML =
      recent.length
        ? recent
            .map(
              rowHtml
            )
            .join("")
        : `

          <tr>

            <td
              colspan="6"
              class="empty"
            >
              No deliveries yet.
            </td>

          </tr>
        `;
  }


  const statuses = [

    "Pending",

    "Out for Delivery",

    "Delivered",

    "Cancelled"

  ];


  if ($("statusOverview")) {

    $("statusOverview")
      .innerHTML =
      statuses
        .map(
          status => {

            const count =
              normalized.filter(
                d =>
                  d.status ===
                  status
              ).length;


            const percentage =
              total
                ? Math.max(
                    count
                      ? 3
                      : 0,

                    (
                      count /
                      total
                    ) *
                    100
                  )

                : 0;


            return `

              <div class="status-line">

                <span>
                  ${escapeHtml(
                    status
                  )}
                </span>

                <div class="bar">

                  <i
                    style="width:${percentage}%"
                  ></i>

                </div>

                <b>
                  ${count}
                </b>

              </div>

            `;
          }
        )
        .join("");
  }
}


/* =========================================================
   RECENT TABLE ROW
========================================================= */

function rowHtml(d) {

  return `

    <tr>

      <td>
        <b>
          ${escapeHtml(
            d.reference ||
            "—"
          )}
        </b>
      </td>

      <td>
        ${escapeHtml(
          d.date ||
          "—"
        )}
      </td>

      <td>
        ${escapeHtml(
          d.customer ||
          "—"
        )}
      </td>

      <td>
        ${escapeHtml(
          d.driver ||
          "—"
        )}
      </td>

      <td>
        ${badge(
          d.status
        )}
      </td>

      <td>

        <div class="row-actions">

          <button
            class="icon-btn"
            type="button"
            onclick="editDelivery('${escapeHtml(d.id)}')"
          >
            Edit
          </button>

          <button
            class="icon-btn"
            type="button"
            onclick="printDelivery('${escapeHtml(d.id)}')"
          >
            Print
          </button>

        </div>

      </td>

    </tr>

  `;
}


/* =========================================================
   ALL DELIVERIES
========================================================= */

function renderTable() {

  const searchElement =
    $("searchInput");


  const statusElement =
    $("statusFilter");


  const query =
    searchElement
      ? searchElement.value
          .toLowerCase()
          .trim()
      : "";


  const status =
    statusElement
      ? statusElement.value
      : "";


  const rows =
    deliveries
      .map(
        normalizeDelivery
      )
      .filter(
        d =>
          !status ||
          d.status === status
      )
      .filter(
        d => {

          if (!query) {
            return true;
          }


          return [

            d.reference,

            d.customer,

            d.phone,

            d.driver,

            d.vehicle,

            d.address,

            d.items,

            d.notes

          ]
            .join(" ")
            .toLowerCase()
            .includes(
              query
            );
        }
      )
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      );


  if ($("allTable")) {

    $("allTable")
      .innerHTML =
      rows
        .map(
          d => `

            <tr>

              <td>
                <b>
                  ${escapeHtml(
                    d.reference ||
                    "—"
                  )}
                </b>
              </td>

              <td>
                ${escapeHtml(
                  d.date ||
                  "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  d.customer ||
                  "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  d.phone ||
                  "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  d.driver ||
                  "—"
                )}
              </td>

              <td>
                ${badge(
                  d.status
                )}
              </td>

              <td>

                <div class="row-actions">

                  <button
                    class="icon-btn"
                    type="button"
                    onclick="editDelivery('${escapeHtml(d.id)}')"
                  >
                    Edit
                  </button>

                  <button
                    class="icon-btn"
                    type="button"
                    onclick="printDelivery('${escapeHtml(d.id)}')"
                  >
                    Print
                  </button>

                  <button
                    class="icon-btn"
                    type="button"
                    onclick="deleteDelivery('${escapeHtml(d.id)}')"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          `
        )
        .join("");
  }


  if ($("emptyState")) {

    $("emptyState")
      .classList.toggle(
        "hidden",
        rows.length > 0
      );
  }
}


/* =========================================================
   PRINT DELIVERY
========================================================= */

function printDelivery(id) {

  const raw =
    deliveries.find(
      d =>
        d.id === id
    );


  if (!raw) {
    return;
  }


  const d =
    normalizeDelivery(
      raw
    );


  const w =
    window.open(
      "",
      "_blank",
      "width=900,height=750"
    );


  if (!w) {

    alert(
      "Please allow pop-ups to print the delivery note."
    );

    return;
  }


  const items =
    escapeHtml(
      d.items
    ).replace(
      /\n/g,
      "<br>"
    );


  const notes =
    escapeHtml(
      d.notes ||
      ""
    ).replace(
      /\n/g,
      "<br>"
    );


  w.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <title>
        ${escapeHtml(
          d.reference
        )}
      </title>

      <style>

        * {
          box-sizing:border-box;
        }

        body {
          margin:0;
          padding:40px;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          color:#111;

          background:#fff;
        }

        .page {
          max-width:850px;
          margin:auto;
        }

        .header {
          display:flex;
          align-items:center;
          justify-content:space-between;

          padding-bottom:20px;

          border-bottom:4px solid #FCC224;
        }

        .logo {
          width:75px;
          height:75px;

          object-fit:cover;

          border-radius:12px;
        }

        .company h1 {
          margin:0;

          font-size:25px;

          font-weight:900;
        }

        .company p {
          margin:5px 0 0;

          color:#666;

          font-size:12px;
        }

        .reference {
          text-align:right;

          background:#fff7d6;

          padding:12px 15px;

          border-radius:8px;
        }

        .reference span {
          display:block;

          color:#8b6500;

          font-size:9px;

          font-weight:bold;

          letter-spacing:1px;
        }

        .reference strong {
          display:block;

          margin-top:4px;

          font-size:13px;
        }

        h2 {
          margin:25px 0 10px;

          font-size:16px;
        }

        table {
          width:100%;

          border-collapse:collapse;

          margin-top:15px;
        }

        td {
          padding:10px 12px;

          border-bottom:1px solid #e5e5e5;

          vertical-align:top;

          font-size:12px;
        }

        td:first-child {
          width:180px;

          font-weight:bold;

          background:#fafafa;
        }

        .items {
          white-space:normal;

          line-height:1.7;
        }

        .signature-area {
          display:grid;

          grid-template-columns:
            1fr 1fr;

          gap:50px;

          margin-top:80px;
        }

        .signature {
          padding-top:35px;

          border-top:1px solid #222;

          font-size:11px;

          color:#555;
        }

        .footer {
          margin-top:50px;

          padding-top:15px;

          border-top:2px solid #FCC224;

          color:#777;

          font-size:10px;

          text-align:center;
        }

        @media print {

          body {
            padding:20px;
          }

        }

      </style>

    </head>

    <body>

      <div class="page">

        <div class="header">

          <div>

            <img
              src="logo.png"
              class="logo"
              alt="AL JEFOON TENTS"
            >

          </div>

          <div class="company">

            <h1>
              AL JEFOON TENTS
            </h1>

            <p>
              Delivery Management System
            </p>

          </div>

          <div class="reference">

            <span>
              DELIVERY REFERENCE
            </span>

            <strong>
              ${escapeHtml(
                d.reference
              )}
            </strong>

          </div>

        </div>


        <h2>
          Delivery Note
        </h2>


        <table>

          <tr>
            <td>Delivery Date</td>
            <td>
              ${escapeHtml(
                d.date
              )}
            </td>
          </tr>

          <tr>
            <td>Status</td>
            <td>
              ${escapeHtml(
                d.status
              )}
            </td>
          </tr>

          <tr>
            <td>Customer / Company</td>
            <td>
              ${escapeHtml(
                d.customer
              )}
            </td>
          </tr>

          <tr>
            <td>Contact Number</td>
            <td>
              ${escapeHtml(
                d.phone ||
                "—"
              )}
            </td>
          </tr>

          <tr>
            <td>Delivery Address</td>
            <td>
              ${escapeHtml(
                d.address ||
                "—"
              )}
            </td>
          </tr>

          <tr>
            <td>Driver</td>
            <td>
              ${escapeHtml(
                d.driver ||
                "—"
              )}
            </td>
          </tr>

          <tr>
            <td>Vehicle</td>
            <td>
              ${escapeHtml(
                d.vehicle ||
                "—"
              )}
            </td>
          </tr>

          <tr>
            <td>Expected Time</td>
            <td>
              ${escapeHtml(
                d.expected_time ||
                "—"
              )}
            </td>
          </tr>

          <tr>
            <td>Items / Equipment</td>
            <td class="items">
              ${items}
            </td>
          </tr>

          <tr>
            <td>Notes</td>
            <td class="items">
              ${notes || "—"}
            </td>
          </tr>

        </table>


        <div class="signature-area">

          <div class="signature">
            Driver Signature
          </div>

          <div class="signature">
            Customer Signature
          </div>

        </div>


        <div class="footer">
          AL JEFOON TENTS — Delivery Note
        </div>

      </div>


      <script>

        window.onload = function() {
          window.print();
        };

      <\/script>

    </body>

    </html>

  `);


  w.document.close();
}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCsv() {

  const headers = [

    "Reference",
    "Date",
    "Status",
    "Customer",
    "Phone",
    "Address",
    "Driver",
    "Vehicle",
    "Expected Time",
    "Items",
    "Notes"

  ];


  const rows =
    deliveries
      .map(
        normalizeDelivery
      )
      .map(
        d => [

          d.reference,
          d.date,
          d.status,
          d.customer,
          d.phone,
          d.address,
          d.driver,
          d.vehicle,
          d.expected_time,
          d.items,
          d.notes

        ]
      );


  const csv =
    [
      headers,
      ...rows
    ]
      .map(
        row =>
          row
            .map(
              value =>
                `"${String(
                  value ?? ""
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");


  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;

  a.download =
    "al-jefoon-deliveries.csv";


  document.body.appendChild(
    a
  );

  a.click();

  a.remove();


  URL.revokeObjectURL(
    url
  );


  toast(
    "CSV exported successfully."
  );
}


/* =========================================================
   BACKUP
========================================================= */

function backup() {

  const data =
    deliveries.map(
      normalizeDelivery
    );


  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;

  a.download =
    `ajt-delivery-backup-${new Date()
      .toISOString()
      .slice(
        0,
        10
      )}.json`;


  document.body.appendChild(
    a
  );

  a.click();

  a.remove();


  URL.revokeObjectURL(
    url
  );


  toast(
    "Backup downloaded successfully."
  );
}


/* =========================================================
   RESTORE BACKUP
========================================================= */

async function restoreBackup(file) {

  try {

    const data =
      JSON.parse(
        await file.text()
      );


    if (
      !Array.isArray(data)
    ) {

      throw new Error(
        "Backup must contain an array."
      );
    }


    if (
      !data.length
    ) {

      toast(
        "Backup contains no deliveries."
      );

      return;
    }


    const confirmed =
      confirm(
        `Restore ${data.length} deliveries?`
      );


    if (!confirmed) {
      return;
    }


    const existingIds =
      new Set(
        deliveries.map(
          d =>
            d.id
        )
      );


    const records =
      data.map(
        d => {

          const item =
            normalizeDelivery(
              d
            );


          let id =
            item.id ||
            generateId();


          while (
            existingIds.has(id)
          ) {

            id =
              generateId();
          }


          existingIds.add(id);


          const now =
            new Date()
              .toISOString();


          return {

            id:

              id,

            reference_number:

              item.reference ||
              null,

            delivery_date:

              item.date ||
              null,

            status:

              item.status ||
              "Pending",

            customer_name:

              item.customer ||
              "",

            phone:

              item.phone ||
              "",

            address:

              item.address ||
              "",

            driver:

              item.driver ||
              "",

            vehicle:

              item.vehicle ||
              "",

            expected_time:

              item.expected_time ||
              "",

            items:

              item.items ||
              "",

            notes:

              item.notes ||
              "",

            created_at:

              item.created_at ||
              now,

            updated_at:

              now
          };
        }
      );


    deliveries =
      [
        ...records,
        ...deliveries
      ];


    if (!saveLocalData()) {
      return;
    }


    renderDashboard();

    renderTable();


    toast(
      "Backup restored successfully."
    );


  } catch (error) {

    console.error(
      "Restore error:",
      error
    );


    alert(
      error.message ||
      "Invalid backup file."
    );
  }
}


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

  const element =
    $("toast");


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  clearTimeout(
    element._toastTimer
  );


  element._toastTimer =
    setTimeout(
      () => {

        element.classList.remove(
          "show"
        );

      },
      2800
    );
}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

function initApp() {

  /* -------------------------------------------------------
     LOAD SAVED DATA
  ------------------------------------------------------- */

  loadDeliveries();


  /* -------------------------------------------------------
     APPLY DARK MODE
  ------------------------------------------------------- */

  applyDarkMode();


  /* -------------------------------------------------------
     DARK MODE BUTTON
  ------------------------------------------------------- */

  const darkModeButton =
    $("darkModeToggle");


  if (darkModeButton) {

    darkModeButton.addEventListener(
      "click",
      toggleDarkMode
    );
  }


  /* -------------------------------------------------------
     DELIVERY FORM
  ------------------------------------------------------- */

  const deliveryForm =
    $("deliveryForm");


  if (deliveryForm) {

    deliveryForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const button =
          $("saveDeliveryBtn");


        const data = {

          date:
            $("deliveryDate")
              ? $("deliveryDate").value
              : "",

          status:
            $("status")
              ? $("status").value
              : "Pending",

          customer:
            $("customer")
              ? $("customer")
                  .value
                  .trim()
              : "",

          phone:
            $("phone")
              ? $("phone")
                  .value
                  .trim()
              : "",

          address:
            $("address")
              ? $("address")
                  .value
                  .trim()
              : "",

          driver:
            $("driver")
              ? $("driver")
                  .value
                  .trim()
              : "",

          vehicle:
            $("vehicle")
              ? $("vehicle")
                  .value
                  .trim()
              : "",

          expected_time:
            $("expectedTime")
              ? $("expectedTime").value
              : "",

          items:
            $("items")
              ? $("items")
                  .value
                  .trim()
              : "",

          notes:
            $("notes")
              ? $("notes")
                  .value
                  .trim()
              : ""
        };


        if (
          !deliveryForm.checkValidity()
        ) {

          deliveryForm.reportValidity();

          return;
        }


        if (button) {

          button.disabled =
            true;

          button.innerHTML =
            "<span>⏳</span> Saving...";
        }


        try {

          const saved =
            saveDelivery(
              data
            );


          if (!saved) {
            return;
          }


          editingId =
            null;


          deliveryForm.reset();


          showView(
            "dashboard"
          );


        } finally {

          if (button) {

            button.disabled =
              false;

            button.innerHTML =
              "<span>✓</span> Save Delivery";
          }
        }
      }
    );
  }


  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const view =
              button.dataset.view;


            if (
              view ===
              "new"
            ) {

              openNew();

            } else {

              showView(
                view
              );
            }
          }
        );
      }
    );


  /* -------------------------------------------------------
     TOP NEW BUTTON
  ------------------------------------------------------- */

  const topNewBtn =
    $("topNewBtn");


  if (topNewBtn) {

    topNewBtn.addEventListener(
      "click",
      openNew
    );
  }


  /* -------------------------------------------------------
     TABLE NEW BUTTON
  ------------------------------------------------------- */

  const tableNewBtn =
    $("tableNewBtn");


  if (tableNewBtn) {

    tableNewBtn.addEventListener(
      "click",
      openNew
    );
  }


  /* -------------------------------------------------------
     VIEW ALL
  ------------------------------------------------------- */

  const viewAllBtn =
    $("viewAllBtn");


  if (viewAllBtn) {

    viewAllBtn.addEventListener(
      "click",
      () =>
        showView(
          "deliveries"
        )
    );
  }


  /* -------------------------------------------------------
     CANCEL FORM
  ------------------------------------------------------- */

  const cancelForm =
    $("cancelForm");


  if (cancelForm) {

    cancelForm.addEventListener(
      "click",
      () => {

        editingId =
          null;

        showView(
          "dashboard"
        );
      }
    );
  }


  /* -------------------------------------------------------
     QUICK ACTIONS
  ------------------------------------------------------- */

  document
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const action =
              button.dataset.action;


            if (
              action ===
              "new"
            ) {

              openNew();

            } else {

              showView(
                "deliveries"
              );
            }
          }
        );
      }
    );


  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  const searchInput =
    $("searchInput");


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      renderTable
    );
  }


  /* -------------------------------------------------------
     STATUS FILTER
  ------------------------------------------------------- */

  const statusFilter =
    $("statusFilter");


  if (statusFilter) {

    statusFilter.addEventListener(
      "change",
      renderTable
    );
  }


  /* -------------------------------------------------------
     CLEAR FILTERS
  ------------------------------------------------------- */

  const clearFilters =
    $("clearFilters");


  if (clearFilters) {

    clearFilters.addEventListener(
      "click",
      () => {

        if ($("searchInput")) {

          $("searchInput")
            .value = "";
        }


        if ($("statusFilter")) {

          $("statusFilter")
            .value = "";
        }


        renderTable();
      }
    );
  }


  /* -------------------------------------------------------
     EXPORT CSV
  ------------------------------------------------------- */

  const exportCsvBtn =
    $("exportCsvBtn");


  if (exportCsvBtn) {

    exportCsvBtn.addEventListener(
      "click",
      exportCsv
    );
  }


  /* -------------------------------------------------------
     BACKUP
  ------------------------------------------------------- */

  const backupBtn =
    $("backupBtn");


  if (backupBtn) {

    backupBtn.addEventListener(
      "click",
      backup
    );
  }


  /* -------------------------------------------------------
     RESTORE
  ------------------------------------------------------- */

  const restoreInput =
    $("restoreInput");


  if (restoreInput) {

    restoreInput.addEventListener(
      "change",
      event => {

        const file =
          event.target.files[0];


        if (file) {

          restoreBackup(
            file
          );
        }


        event.target.value =
          "";
      }
    );
  }


  /* -------------------------------------------------------
     INITIAL DISPLAY
  ------------------------------------------------------- */

  renderDashboard();

  showView(
    "dashboard"
  );
}


/* =========================================================
   START
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initApp
  );

} else {

  initApp();
}
