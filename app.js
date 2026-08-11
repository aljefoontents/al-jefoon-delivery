const SUPABASE_URL = "https://fhgptbaeyvwwgvrdrufu.supabase.co";
const SUPABASE_KEY = "sb_publishable_qKCf-rC8pKpw7CFvECWWSg_TFVDKLmg";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let deliveries = [];
let editingId = null;
let currentUser = null;

const $ = id => document.getElementById(id);

const views = {
dashboard: $("dashboardView"),
deliveries: $("deliveriesView"),
new: $("newView")
};

/* =========================================================
LOGIN SCREEN
========================================================= */

function createLoginScreen() {

if ($("loginScreen")) return;

const screen = document.createElement("div");

screen.id = "loginScreen";

screen.style.position = "fixed";
screen.style.inset = "0";
screen.style.zIndex = "999999";
screen.style.width = "100vw";
screen.style.height = "100vh";
screen.style.display = "flex";

screen.innerHTML = ` <div style="
   min-height:100vh;
   width:100%;
   display:flex;
   align-items:center;
   justify-content:center;
   background:#f5f6f8;
   padding:20px;
   box-sizing:border-box;
 ">

```
  <div style="
    width:100%;
    max-width:420px;
    background:white;
    padding:40px;
    border-radius:16px;
    box-shadow:0 15px 40px rgba(0,0,0,.12);
    box-sizing:border-box;
  ">

    <div style="
      text-align:center;
      margin-bottom:30px;
    ">

      <div style="
        width:70px;
        height:70px;
        margin:0 auto 15px;
        background:#fcc224;
        border-radius:16px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:800;
        font-size:22px;
      ">
        AJT
      </div>

      <h1 style="
        margin:0 0 6px;
        font-size:25px;
        color:#111;
      ">
        AL JEFOON TENTS
      </h1>

      <p style="
        margin:0;
        color:#777;
      ">
        Delivery Management System
      </p>

    </div>

    <form id="loginForm">

      <label style="
        display:block;
        margin-bottom:6px;
        font-weight:600;
        color:#222;
      ">
        Email
      </label>

      <input
        id="loginEmail"
        type="email"
        required
        autocomplete="username"
        placeholder="Enter your email"
        style="
          width:100%;
          padding:13px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:18px;
          box-sizing:border-box;
          font-size:15px;
        "
      >

      <label style="
        display:block;
        margin-bottom:6px;
        font-weight:600;
        color:#222;
      ">
        Password
      </label>

      <input
        id="loginPassword"
        type="password"
        required
        autocomplete="current-password"
        placeholder="Enter your password"
        style="
          width:100%;
          padding:13px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:18px;
          box-sizing:border-box;
          font-size:15px;
        "
      >

      <div
        id="loginError"
        style="
          display:none;
          background:#fff0f0;
          color:#c62828;
          padding:11px;
          border-radius:8px;
          margin-bottom:15px;
          font-size:14px;
        "
      ></div>

      <button
        type="submit"
        id="loginButton"
        style="
          width:100%;
          padding:14px;
          border:0;
          border-radius:8px;
          background:#fcc224;
          color:#111;
          font-weight:700;
          font-size:16px;
          cursor:pointer;
        "
      >
        Sign In
      </button>

    </form>

  </div>

</div>
```

`;

document.body.appendChild(screen);

$("loginForm").addEventListener("submit", login);
}

/* =========================================================
LOGIN
========================================================= */

async function login(e) {

e.preventDefault();

const email = $("loginEmail").value.trim();
const password = $("loginPassword").value;

const button = $("loginButton");
const error = $("loginError");

error.style.display = "none";

button.disabled = true;
button.textContent = "Signing in...";

const {
data,
error: loginError
} = await db.auth.signInWithPassword({
email,
password
});

if (loginError) {

```
error.textContent = loginError.message;
error.style.display = "block";

button.disabled = false;
button.textContent = "Sign In";

return;
```

}

currentUser = data.user;

$("loginScreen").style.display = "none";

const appShell = document.querySelector(".app-shell");

if (appShell) {
appShell.style.display = "flex";
}

await loadDeliveries();

addLogoutButton();

renderDashboard();

button.disabled = false;
button.textContent = "Sign In";
}

/* =========================================================
LOGOUT BUTTON
========================================================= */

function addLogoutButton() {

if ($("logoutButton")) return;

const footer = document.querySelector(".sidebar-footer");

if (!footer || !currentUser) return;

footer.innerHTML = ` <div style="
   margin-bottom:10px;
   font-size:12px;
   line-height:1.5;
 ">
Signed in as<br> <strong>${escapeHtml(currentUser.email)}</strong> </div>

```
<button
  id="logoutButton"
  style="
    border:1px solid #ddd;
    background:white;
    padding:8px 12px;
    border-radius:7px;
    cursor:pointer;
  "
>
  Sign Out
</button>
```

`;

$("logoutButton").onclick = logout;
}

/* =========================================================
LOGOUT
========================================================= */

async function logout() {

await db.auth.signOut();

currentUser = null;
deliveries = [];
editingId = null;

const appShell =
document.querySelector(".app-shell");

if (appShell) {
appShell.style.display = "none";
}

if ($("logoutButton")) {
$("logoutButton").remove();
}

if ($("loginScreen")) {

```
$("loginScreen").style.display = "flex";

$("loginEmail").value = "";
$("loginPassword").value = "";

$("loginError").style.display = "none";

$("loginButton").disabled = false;
$("loginButton").textContent = "Sign In";
```

}
}

/* =========================================================
LOAD DELIVERIES FROM SUPABASE
========================================================= */

async function loadDeliveries() {

if (!currentUser) return;

const {
data,
error
} = await db
.from("deliveries")
.select("*")
.eq("user_id", currentUser.id)
.order("created_at", {
ascending: false
});

if (error) {

```
console.error("Load deliveries error:", error);

toast("Unable to load deliveries.");

return;
```

}

deliveries = data || [];
}

/* =========================================================
NORMALIZE DATABASE RECORD
========================================================= */

function normalizeDelivery(d) {

return {
...d,

```
reference:
  d.reference_number ||
  d.reference ||
  "",

date:
  d.delivery_date ||
  d.date ||
  "",

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
  null,

items:
  d.items ||
  "",

notes:
  d.notes ||
  "",

status:
  d.status ||
  "Pending"
```

};
}

/* =========================================================
SAVE DELIVERY
========================================================= */

async function saveDelivery(data) {

if (!currentUser) {

```
toast("Please sign in first.");

return false;
```

}

/* EDIT EXISTING DELIVERY */

if (editingId) {

```
const updateData = {

  delivery_date:
    data.date || null,

  status:
    data.status || "Pending",

  customer_name:
    data.customer || "",

  phone:
    data.phone || "",

  address:
    data.address || "",

  driver:
    data.driver || "",

  vehicle:
    data.vehicle || "",

  expected_time:
    data.expected_time || null,

  items:
    data.items || "",

  notes:
    data.notes || "",

  updated_at:
    new Date().toISOString()

};

const {
  error
} = await db
  .from("deliveries")
  .update(updateData)
  .eq("id", editingId)
  .eq("user_id", currentUser.id);

if (error) {

  console.error("Update error:", error);

  toast("Unable to update delivery.");

  return false;
}

toast("Delivery updated.");
```

}

/* CREATE NEW DELIVERY */

else {

```
const reference =
  await nextRef();

const newDelivery = {

  reference_number:
    reference,

  delivery_date:
    data.date || null,

  status:
    data.status || "Pending",

  customer_name:
    data.customer || "",

  phone:
    data.phone || "",

  address:
    data.address || "",

  driver:
    data.driver || "",

  vehicle:
    data.vehicle || "",

  expected_time:
    data.expected_time || null,

  items:
    data.items || "",

  notes:
    data.notes || "",

  user_id:
    currentUser.id

};

const {
  error
} = await db
  .from("deliveries")
  .insert(newDelivery);

if (error) {

  console.error("Insert error:", error);

  toast(
    "Unable to save delivery: " +
    error.message
  );

  return false;
}

toast("Delivery saved.");
```

}

await loadDeliveries();

return true;
}

/* =========================================================
DELETE DELIVERY
========================================================= */

async function deleteDelivery(id) {

const raw =
deliveries.find(x => x.id === id);

if (!raw) return;

const d =
normalizeDelivery(raw);

if (!confirm(`Delete ${d.reference}?`)) {
return;
}

const {
error
} = await db
.from("deliveries")
.delete()
.eq("id", id)
.eq("user_id", currentUser.id);

if (error) {

```
console.error("Delete error:", error);

toast("Unable to delete delivery.");

return;
```

}

await loadDeliveries();

renderTable();
renderDashboard();

toast("Delivery deleted.");
}

/* =========================================================
GENERATE REFERENCE NUMBER
========================================================= */

async function nextRef() {

const year =
new Date().getFullYear();

const numbers =
deliveries
.map(raw => {

```
    const d =
      normalizeDelivery(raw);

    const match =
      String(d.reference || "")
        .match(/(\d{4})$/);

    return match
      ? parseInt(match[1], 10)
      : 0;
  })
  .filter(Number.isFinite);
```

const nextNumber =
(numbers.length
? Math.max(...numbers)
: 0) + 1;

return `AJT-DEL-${year}-${String(nextNumber).padStart(4, "0")}`;
}

/* =========================================================
HTML SECURITY
========================================================= */

function escapeHtml(value = "") {

return String(value)
.replace(/[&<>"']/g, character => ({

```
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"

}[character]));
```

}

/* =========================================================
STATUS BADGE
========================================================= */

function badge(status) {

const className =
status === "Pending"
? "pending"
: status === "Out for Delivery"
? "out"
: status === "Delivered"
? "delivered"
: "cancelled";

return `     <span class="badge ${className}">
      ${escapeHtml(status)}     </span>
  `;
}

/* =========================================================
SHOW VIEW
========================================================= */

function showView(name) {

Object.values(views)
.forEach(view => {

```
  if (view) {
    view.classList.add("hidden");
  }

});
```

if (!views[name]) return;

views[name]
.classList.remove("hidden");

document
.querySelectorAll(".nav-btn")
.forEach(button =>
button.classList.toggle(
"active",
button.dataset.view === name
)
);

const titles = {

```
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
```

};

if ($("pageTitle")) {
$("pageTitle").textContent =
titles[name][0];
}

if ($("pageSubtitle")) {
$("pageSubtitle").textContent =
titles[name][1];
}

if (name === "dashboard") {
renderDashboard();
}

if (name === "deliveries") {
renderTable();
}
}

/* =========================================================
NEW DELIVERY
========================================================= */

function openNew() {

editingId = null;

if (!$("deliveryForm")) return;

$("deliveryForm").reset();

if ($("editingId")) {
$("editingId").value = "";
}

if ($("deliveryDate")) {

```
$("deliveryDate").value =
  new Date()
    .toISOString()
    .slice(0, 10);
```

}

if ($("status")) {
$("status").value = "Pending";
}

if ($("formTitle")) {
$("formTitle").textContent =
"Create New Delivery";
}

if ($("refPreview")) {

```
$("refPreview").textContent =
  "Generating...";

nextRef().then(reference => {

  $("refPreview").textContent =
    reference;

});
```

}

showView("new");
}

/* =========================================================
EDIT DELIVERY
========================================================= */

function editDelivery(id) {

const raw =
deliveries.find(x => x.id === id);

if (!raw) return;

const d =
normalizeDelivery(raw);

editingId = id;

$("formTitle").textContent =
"Edit Delivery";

$("refPreview").textContent =
d.reference;

$("deliveryDate").value =
d.date || "";

$("status").value =
d.status || "Pending";

$("customer").value =
d.customer || "";

$("phone").value =
d.phone || "";

$("address").value =
d.address || "";

$("driver").value =
d.driver || "";

$("vehicle").value =
d.vehicle || "";

$("expectedTime").value =
d.expected_time || "";

$("items").value =
d.items || "";

$("notes").value =
d.notes || "";

showView("new");
}

/* =========================================================
DASHBOARD
========================================================= */

function renderDashboard() {

if (!$("statTotal")) return;

const normalized =
deliveries.map(normalizeDelivery);

const total =
normalized.length;

const pending =
normalized.filter(
d => d.status === "Pending"
).length;

const out =
normalized.filter(
d => d.status === "Out for Delivery"
).length;

const delivered =
normalized.filter(
d => d.status === "Delivered"
).length;

$("statTotal").textContent =
total;

$("statPending").textContent =
pending;

$("statOut").textContent =
out;

$("statDelivered").textContent =
delivered;

$("recentTable").innerHTML =
normalized
.slice()
.sort(
(a, b) =>
new Date(b.created_at || 0) -
new Date(a.created_at || 0)
)
.slice(0, 8)
.map(rowHtml)
.join("")
||
`         <tr>           <td colspan="6" class="empty">
            No deliveries yet.           </td>         </tr>
      `;

const statuses = [
"Pending",
"Out for Delivery",
"Delivered",
"Cancelled"
];

$("statusOverview").innerHTML =
statuses
.map(status => {

```
    const count =
      normalized.filter(
        d => d.status === status
      ).length;

    const percentage =
      total
        ? Math.max(
            2,
            count / total * 100
          )
        : 0;

    return `
      <div class="status-line">

        <span>
          ${status}
        </span>

        <div class="bar">
          <i style="
            width:${percentage}%
          "></i>
        </div>

        <b>
          ${count}
        </b>

      </div>
    `;

  })
  .join("");
```

}

/* =========================================================
RECENT DELIVERY ROW
========================================================= */

function rowHtml(d) {

return ` <tr>

```
  <td>
    <b>
      ${escapeHtml(d.reference)}
    </b>
  </td>

  <td>
    ${escapeHtml(d.date || "")}
  </td>

  <td>
    ${escapeHtml(d.customer || "")}
  </td>

  <td>
    ${escapeHtml(d.driver || "—")}
  </td>

  <td>
    ${badge(d.status)}
  </td>

  <td>

    <div class="row-actions">

      <button
        class="icon-btn"
        onclick="editDelivery('${d.id}')"
      >
        Edit
      </button>

      <button
        class="icon-btn"
        onclick="printDelivery('${d.id}')"
      >
        Print
      </button>

    </div>

  </td>

</tr>
```

`;
}

/* =========================================================
ALL DELIVERIES TABLE
========================================================= */

function renderTable() {

if (!$("searchInput") || !$("statusFilter")) {
return;
}

const query =
$("searchInput")
.value
.toLowerCase()
.trim();

const status =
$("statusFilter").value;

const rows =
deliveries
.map(normalizeDelivery)
.filter(
d =>
!status ||
d.status === status
)
.filter(d =>
!query ||
[
d.reference,
d.customer,
d.phone,
d.driver,
d.vehicle,
d.address,
d.items
]
.join(" ")
.toLowerCase()
.includes(query)
)
.sort(
(a, b) =>
new Date(b.created_at || 0) -
new Date(a.created_at || 0)
);

$("allTable").innerHTML =
rows
.map(d => `

```
    <tr>

      <td>
        <b>
          ${escapeHtml(d.reference)}
        </b>
      </td>

      <td>
        ${escapeHtml(d.date || "")}
      </td>

      <td>
        ${escapeHtml(d.customer || "")}
      </td>

      <td>
        ${escapeHtml(d.phone || "—")}
      </td>

      <td>
        ${escapeHtml(d.driver || "—")}
      </td>

      <td>
        ${badge(d.status)}
      </td>

      <td>

        <div class="row-actions">

          <button
            class="icon-btn"
            onclick="editDelivery('${d.id}')"
          >
            Edit
          </button>

          <button
            class="icon-btn"
            onclick="printDelivery('${d.id}')"
          >
            Print
          </button>

          <button
            class="icon-btn"
            onclick="deleteDelivery('${d.id}')"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>

  `)
  .join("");
```

$("emptyState")
.classList
.toggle(
"hidden",
rows.length > 0
);
}

/* =========================================================
PRINT DELIVERY
========================================================= */

function printDelivery(id) {

const raw =
deliveries.find(x => x.id === id);

if (!raw) return;

const d =
normalizeDelivery(raw);

const w =
window.open(
"",
"_blank",
"width=850,height=700"
);

if (!w) {

```
alert(
  "Please allow pop-ups to print the delivery."
);

return;
```

}

w.document.write(`

```
<html>

<head>

  <title>
    ${escapeHtml(d.reference)}
  </title>

  <style>

    body {
      font-family: Arial;
      padding: 35px;
      color: #111;
    }

    h1 {
      margin: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 25px;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }

    td:first-child {
      font-weight: bold;
      width: 180px;
    }

    .items {
      white-space: pre-wrap;
    }

  </style>

</head>

<body>

  <h1>
    AL JEFOON TENTS
  </h1>

  <p>
    Delivery Note
  </p>

  <hr>

  <table>

    <tr>
      <td>Reference</td>
      <td>
        ${escapeHtml(d.reference)}
      </td>
    </tr>

    <tr>
      <td>Date</td>
      <td>
        ${escapeHtml(d.date)}
      </td>
    </tr>

    <tr>
      <td>Customer</td>
      <td>
        ${escapeHtml(d.customer)}
      </td>
    </tr>

    <tr>
      <td>Phone</td>
      <td>
        ${escapeHtml(d.phone)}
      </td>
    </tr>

    <tr>
      <td>Address</td>
      <td>
        ${escapeHtml(d.address)}
      </td>
    </tr>

    <tr>
      <td>Driver</td>
      <td>
        ${escapeHtml(d.driver)}
      </td>
    </tr>

    <tr>
      <td>Vehicle</td>
      <td>
        ${escapeHtml(d.vehicle)}
      </td>
    </tr>

    <tr>
      <td>Expected Time</td>
      <td>
        ${escapeHtml(d.expected_time)}
      </td>
    </tr>

    <tr>
      <td>Status</td>
      <td>
        ${escapeHtml(d.status)}
      </td>
    </tr>

    <tr>
      <td>Items / Equipment</td>
      <td class="items">
        ${escapeHtml(d.items)}
      </td>
    </tr>

    <tr>
      <td>Notes</td>
      <td class="items">
        ${escapeHtml(d.notes)}
      </td>
    </tr>

  </table>

  <p style="margin-top:60px">
    Customer Signature:
    __________________________________________
  </p>

  <script>
    window.print();
  <\/script>

</body>

</html>
```

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
deliveries.map(raw => {

```
  const d =
    normalizeDelivery(raw);

  return [
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
  ];

});
```

const csv =
[headers, ...rows]
.map(row =>
row
.map(value =>
`"${String(value ?? "")
              .replace(/"/g, '""')}"`
)
.join(",")
)
.join("\n");

const url =
URL.createObjectURL(
new Blob(
[csv],
{
type: "text/csv"
}
)
);

const a =
document.createElement("a");

a.href = url;

a.download =
"al-jefoon-deliveries.csv";

a.click();

URL.revokeObjectURL(url);
}

/* =========================================================
BACKUP
========================================================= */

function backup() {

const url =
URL.createObjectURL(
new Blob(
[
JSON.stringify(
deliveries,
null,
2
)
],
{
type: "application/json"
}
)
);

const a =
document.createElement("a");

a.href = url;

a.download =
"ajt-delivery-backup.json";

a.click();

URL.revokeObjectURL(url);
}

/* =========================================================
RESTORE BACKUP
========================================================= */

async function restoreBackup(file) {

try {

```
const data =
  JSON.parse(
    await file.text()
  );

if (!Array.isArray(data)) {
  throw new Error();
}

if (
  !confirm(
    `Restore ${data.length} deliveries into the database?`
  )
) {
  return;
}

const records =
  data.map(raw => {

    const d =
      normalizeDelivery(raw);

    return {

      reference_number:
        d.reference,

      delivery_date:
        d.date || null,

      status:
        d.status || "Pending",

      customer_name:
        d.customer || "",

      phone:
        d.phone || "",

      address:
        d.address || "",

      driver:
        d.driver || "",

      vehicle:
        d.vehicle || "",

      expected_time:
        d.expected_time || null,

      items:
        d.items || "",

      notes:
        d.notes || "",

      user_id:
        currentUser.id

    };

  });

const {
  error
} = await db
  .from("deliveries")
  .insert(records);

if (error) {

  console.error(error);

  alert(error.message);

  return;
}

await loadDeliveries();

renderDashboard();

toast("Backup restored.");
```

} catch (error) {

```
console.error(error);

alert("Invalid backup file.");
```

}
}

/* =========================================================
TOAST
========================================================= */

function toast(message) {

if (!$("toast")) {
alert(message);
return;
}

$("toast").textContent =
message;

$("toast")
.classList
.add("show");

setTimeout(
() =>
$("toast")
.classList
.remove("show"),
2200
);
}

/* =========================================================
DELIVERY FORM
========================================================= */

if ($("deliveryForm")) {

$("deliveryForm")
.addEventListener(
"submit",
async e => {

```
    e.preventDefault();

    const data = {

      date:
        $("deliveryDate").value,

      status:
        $("status").value,

      customer:
        $("customer")
          .value
          .trim(),

      phone:
        $("phone")
          .value
          .trim(),

      address:
        $("address")
          .value
          .trim(),

      driver:
        $("driver")
          .value
          .trim(),

      vehicle:
        $("vehicle")
          .value
          .trim(),

      expected_time:
        $("expectedTime")
          .value ||
        null,

      items:
        $("items")
          .value
          .trim(),

      notes:
        $("notes")
          .value
          .trim()

    };

    const saved =
      await saveDelivery(data);

    if (!saved) return;

    editingId = null;

    showView("dashboard");
  }
);
```

}

/* =========================================================
NAVIGATION BUTTONS
========================================================= */

document
.querySelectorAll(".nav-btn")
.forEach(button => {

```
button.addEventListener(
  "click",
  () => {

    if (
      button.dataset.view === "new"
    ) {

      openNew();

    } else {

      showView(
        button.dataset.view
      );

    }

  }
);
```

});

if ($("topNewBtn")) {

$("topNewBtn").onclick =
openNew;

}

if ($("viewAllBtn")) {

$("viewAllBtn").onclick =
() =>
showView("deliveries");

}

if ($("cancelForm")) {

$("cancelForm").onclick =
() =>
showView("dashboard");

}

document
.querySelectorAll("[data-action]")
.forEach(button => {

```
button.onclick = () => {

  if (
    button.dataset.action === "new"
  ) {

    openNew();

  } else {

    showView("deliveries");

  }

};
```

});

/* =========================================================
SEARCH & FILTERS
========================================================= */

if ($("searchInput")) {

$("searchInput")
.addEventListener(
"input",
renderTable
);

}

if ($("statusFilter")) {

$("statusFilter")
.addEventListener(
"change",
renderTable
);

}

if ($("clearFilters")) {

$("clearFilters").onclick =
() => {

```
  $("searchInput").value = "";

  $("statusFilter").value = "";

  renderTable();

};
```

}

/* =========================================================
EXPORT / BACKUP / RESTORE
========================================================= */

if ($("exportCsvBtn")) {

$("exportCsvBtn").onclick =
exportCsv;

}

if ($("backupBtn")) {

$("backupBtn").onclick =
backup;

}

if ($("restoreInput")) {

$("restoreInput")
.addEventListener(
"change",
e => {

```
    const file =
      e.target.files[0];

    if (file) {
      restoreBackup(file);
    }

    e.target.value = "";

  }
);
```

}

/* =========================================================
START APPLICATION
========================================================= */

async function startApp() {

/*
IMPORTANT:
Hide the actual dashboard until
authentication has been checked.
*/

const appShell =
document.querySelector(".app-shell");

if (appShell) {
appShell.style.display = "none";
}

createLoginScreen();

const {
data: {
session
}
} =
await db.auth.getSession();

/* USER ALREADY LOGGED IN */

if (session) {

```
currentUser =
  session.user;

$("loginScreen")
  .style
  .display = "none";

if (appShell) {
  appShell.style.display = "flex";
}

await loadDeliveries();

addLogoutButton();

renderDashboard();
```

}

/* NO LOGIN */

else {

```
if ($("loginScreen")) {

  $("loginScreen")
    .style
    .display = "flex";

}
```

}

/* AUTHENTICATION LISTENER */

db.auth.onAuthStateChange(
async (event, session) => {

```
  if (
    event === "SIGNED_OUT"
  ) {

    currentUser = null;

    deliveries = [];

    editingId = null;

    const shell =
      document.querySelector(
        ".app-shell"
      );

    if (shell) {
      shell.style.display = "none";
    }

    if ($("loginScreen")) {

      $("loginScreen")
        .style
        .display = "flex";

    }

  }

}
```

);
}

/* =========================================================
RUN
========================================================= */

startApp();

