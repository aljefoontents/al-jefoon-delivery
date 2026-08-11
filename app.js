const KEY = "ajt_delivery_records_v1";
let deliveries = load();
let editingId = null;

const $ = id => document.getElementById(id);
const views = {dashboard:$("dashboardView"), deliveries:$("deliveriesView"), new:$("newView")};

function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(deliveries))}
function nextRef(){
  const year=new Date().getFullYear();
  const nums=deliveries.map(d=>parseInt((d.reference||"").split("-").pop(),10)).filter(Number.isFinite);
  const n=(nums.length?Math.max(...nums):0)+1;
  return `AJT-DEL-${year}-${String(n).padStart(4,"0")}`;
}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function badge(status){const c=status==="Pending"?"pending":status==="Out for Delivery"?"out":status==="Delivered"?"delivered":"cancelled";return `<span class="badge ${c}">${esc(status)}</span>`}
function showView(name){
  Object.values(views).forEach(v=>v.classList.add("hidden")); views[name].classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const titles={dashboard:["Dashboard","Track deliveries, drivers and delivery status."],deliveries:["Deliveries","Search, edit, print or delete delivery records."],new:[editingId?"Edit Delivery":"New Delivery","Create and manage delivery information."]};
  $("pageTitle").textContent=titles[name][0];$("pageSubtitle").textContent=titles[name][1];
  if(name==="dashboard")renderDashboard(); if(name==="deliveries")renderTable();
}
function openNew(){
  editingId=null; $("deliveryForm").reset(); $("editingId").value="";
  $("deliveryDate").value=new Date().toISOString().slice(0,10);
  $("formTitle").textContent="Create New Delivery"; $("refPreview").textContent=nextRef();
  showView("new");
}
function editDelivery(id){
  const d=deliveries.find(x=>x.id===id); if(!d)return;
  editingId=id; $("formTitle").textContent="Edit Delivery"; $("refPreview").textContent=d.reference;
  $("deliveryDate").value=d.date||"";$("status").value=d.status||"Pending";$("customer").value=d.customer||"";
  $("phone").value=d.phone||"";$("address").value=d.address||"";$("driver").value=d.driver||"";
  $("vehicle").value=d.vehicle||"";$("expectedTime").value=d.expectedTime||"";$("items").value=d.items||"";
  $("notes").value=d.notes||""; showView("new");
}
function renderDashboard(){
  const total=deliveries.length,pending=deliveries.filter(d=>d.status==="Pending").length,out=deliveries.filter(d=>d.status==="Out for Delivery").length,done=deliveries.filter(d=>d.status==="Delivered").length;
  $("statTotal").textContent=total;$("statPending").textContent=pending;$("statOut").textContent=out;$("statDelivered").textContent=done;
  $("recentTable").innerHTML=deliveries.slice().sort((a,b)=>b.createdAt-a.createdAt).slice(0,8).map(rowHtml).join("")||`<tr><td colspan="6" class="empty">No deliveries yet.</td></tr>`;
  const counts=["Pending","Out for Delivery","Delivered","Cancelled"].map(s=>[s,deliveries.filter(d=>d.status===s).length]);
  $("statusOverview").innerHTML=counts.map(([s,n])=>`<div class="status-line"><span>${s}</span><div class="bar"><i style="width:${total?Math.max(2,n/total*100):0}%"></i></div><b>${n}</b></div>`).join("");
}
function rowHtml(d){return `<tr><td><b>${esc(d.reference)}</b></td><td>${esc(d.date)}</td><td>${esc(d.customer)}</td><td>${esc(d.driver||"—")}</td><td>${badge(d.status)}</td><td><div class="row-actions"><button class="icon-btn" onclick="editDelivery('${d.id}')">Edit</button><button class="icon-btn" onclick="printDelivery('${d.id}')">Print</button></div></td></tr>`}
function renderTable(){
  const q=$("searchInput").value.toLowerCase().trim(), st=$("statusFilter").value;
  const rows=deliveries.filter(d=>!st||d.status===st).filter(d=>!q||[d.reference,d.customer,d.phone,d.driver,d.vehicle,d.address,d.items].join(" ").toLowerCase().includes(q)).sort((a,b)=>b.createdAt-a.createdAt);
  $("allTable").innerHTML=rows.map(d=>`<tr><td><b>${esc(d.reference)}</b></td><td>${esc(d.date)}</td><td>${esc(d.customer)}</td><td>${esc(d.phone||"—")}</td><td>${esc(d.driver||"—")}</td><td>${badge(d.status)}</td><td><div class="row-actions"><button class="icon-btn" onclick="editDelivery('${d.id}')">Edit</button><button class="icon-btn" onclick="printDelivery('${d.id}')">Print</button><button class="icon-btn" onclick="deleteDelivery('${d.id}')">Delete</button></div></td></tr>`).join("");
  $("emptyState").classList.toggle("hidden",rows.length>0);
}
function deleteDelivery(id){const d=deliveries.find(x=>x.id===id);if(!d)return;if(confirm(`Delete ${d.reference}?`)){deliveries=deliveries.filter(x=>x.id!==id);save();renderTable();renderDashboard();toast("Delivery deleted.")}}
function printDelivery(id){
  const d=deliveries.find(x=>x.id===id);if(!d)return;
  const w=window.open("","_blank","width=850,height=700");
  w.document.write(`<html><head><title>${esc(d.reference)}</title><style>body{font-family:Arial;padding:35px;color:#111}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:25px}td{padding:10px;border-bottom:1px solid #ddd}td:first-child{font-weight:bold;width:180px}.items{white-space:pre-wrap}</style></head><body><h1>AL JEFOON TENTS</h1><p>Delivery Note</p><hr><table><tr><td>Reference</td><td>${esc(d.reference)}</td></tr><tr><td>Date</td><td>${esc(d.date)}</td></tr><tr><td>Customer</td><td>${esc(d.customer)}</td></tr><tr><td>Phone</td><td>${esc(d.phone)}</td></tr><tr><td>Address</td><td>${esc(d.address)}</td></tr><tr><td>Driver</td><td>${esc(d.driver)}</td></tr><tr><td>Vehicle</td><td>${esc(d.vehicle)}</td></tr><tr><td>Expected Time</td><td>${esc(d.expectedTime)}</td></tr><tr><td>Status</td><td>${esc(d.status)}</td></tr><tr><td>Items / Equipment</td><td class="items">${esc(d.items)}</td></tr><tr><td>Notes</td><td class="items">${esc(d.notes)}</td></tr></table><p style="margin-top:60px">Customer Signature: __________________________</p><script>window.print()<\/script></body></html>`);
  w.document.close();
}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function exportCsv(){
  const headers=["Reference","Date","Status","Customer","Phone","Address","Driver","Vehicle","Expected Time","Items","Notes"];
  const csv=[headers,...deliveries.map(d=>headers.map(h=>{const k={Reference:"reference",Date:"date",Status:"status",Customer:"customer",Phone:"phone",Address:"address",Driver:"driver",Vehicle:"vehicle","Expected Time":"expectedTime",Items:"items",Notes:"notes"}[h];return d[k]??""}))].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="al-jefoon-deliveries.csv";a.click();URL.revokeObjectURL(a.href);
}
function backup(){
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(deliveries,null,2)],{type:"application/json"}));a.download="ajt-delivery-backup.json";a.click();URL.revokeObjectURL(a.href);
}
$("deliveryForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data={date:$("deliveryDate").value,status:$("status").value,customer:$("customer").value.trim(),phone:$("phone").value.trim(),address:$("address").value.trim(),driver:$("driver").value.trim(),vehicle:$("vehicle").value.trim(),expectedTime:$("expectedTime").value,items:$("items").value.trim(),notes:$("notes").value.trim()};
  if(editingId){const i=deliveries.findIndex(d=>d.id===editingId);deliveries[i]={...deliveries[i],...data};toast("Delivery updated.")}else{deliveries.push({id:crypto.randomUUID(),reference:nextRef(),...data,createdAt:Date.now()});toast("Delivery saved.")}save();showView("dashboard");
});
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>b.dataset.view==="new"?openNew():showView(b.dataset.view)));
$("topNewBtn").onclick=openNew;$("viewAllBtn").onclick=()=>showView("deliveries");$("cancelForm").onclick=()=>showView("dashboard");
document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>b.dataset.action==="new"?openNew():showView("deliveries"));
$("searchInput").addEventListener("input",renderTable);$("statusFilter").addEventListener("change",renderTable);
$("clearFilters").onclick=()=>{$("searchInput").value="";$("statusFilter").value="";renderTable()};
$("exportCsvBtn").onclick=exportCsv;$("backupBtn").onclick=backup;
$("restoreInput").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw Error();deliveries=data;save();renderDashboard();toast("Backup restored.")}catch{alert("Invalid backup file.")}};r.readAsText(f)});
renderDashboard();
