/**
 * checkout.js — HERA
 *
 * Descripción: Script exclusivo de la página Checkout.
 *              Usa los componentes universales loadNavbar() y loadFooterMinimo()
 *              igual que el resto de páginas del sitio. El navbar universal
 *              cubre: menú móvil, sesión, favoritos-toggle y search.
 *
 *              Comportamiento exclusivo de checkout sobre el navbar universal:
 *              — #cart-btn hace scroll al order-summary en vez de abrir el drawer.
 *              — Los favoritos agregan al cartData local en vez de al cart-drawer.
 *
 *              Maneja: multi-step form, validación, resumen de orden, envío,
 *              pago, códigos promo y submit.
 *
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/checkout.html vía <script type="module">
 */

import { loadNavbar }       from '../components/navbar.js';
import { loadFooterMinimo } from '../components/footer-minimo.js';

/* ══════════════════════════════════════════════════════════════
  CONSTANTES
══════════════════════════════════════════════════════════════ */
var FREE_SHIPPING  = 1500;
var cartData       = [];
var shippingCost   = 99;
var discountAmount = 0;
var currentStep    = 1;
var maxStepReached = 1;
var favorites      = [];
var cartBadge      = null;

/* ══════════════════════════════════════════════════════════════
  ARRANQUE
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  // Componentes universales — igual que el resto de páginas del sitio
  await loadNavbar();
  loadFooterMinimo();

  // cartBadge vive en el navbar inyectado — asignar después del await
  cartBadge = document.getElementById('cart-count');

  // Comportamiento exclusivo de checkout sobre elementos del navbar universal
  _initCartBtn();
  _initFavs();

  // Lógica exclusiva de esta página
  _initCustomSelect();
  _initFormListeners();
  _initStepNav();
  _initShipping();
  _initPayment();
  _initScrollReveal();
  loadCart();
});

/* ══════════════════════════════════════
  CART BTN — override de checkout
  El navbar universal tiene #cart-btn pero
  en checkout no existe drawer: scroll al
  order-summary en vez de abrir el drawer.
══════════════════════════════════════ */
function _initCartBtn() {
  var cartBtn = document.getElementById('cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() {
      var summary = document.querySelector('.order-summary');
      if (summary) summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

/* ══════════════════════════════════════
  FAVORITOS — versión checkout
  El toggle del dropdown (#fav-toggle) ya
  lo maneja navbar.js/_initFavDropdown().
  Aquí solo: render de filas en el dropdown
  del navbar y agregar al cartData local.
══════════════════════════════════════ */
function _initFavs() {
  try { var sf = localStorage.getItem('hera_favs'); if (sf) favorites = JSON.parse(sf); } catch(e) { favorites = []; }

  var favAddAllBtn = document.getElementById('fav-add-all-btn');
  if (favAddAllBtn) {
    favAddAllBtn.addEventListener('click', function() {
      if (!favorites.length) return;
      favorites.forEach(function(f) { _addFavToCheckoutCart(f); });
    });
  }

  renderFavsCheckout();
}

function renderFavsCheckout() {
  var favCountBadge  = document.getElementById('fav-count');
  var favCountLabel  = document.getElementById('fav-count-label');
  var favList        = document.getElementById('fav-list');
  var favEmptyEl     = document.getElementById('fav-empty');
  var favCountMobile = document.getElementById('fav-count-mobile');
  var favListMobile  = document.getElementById('fav-list-mobile');
  var favEmptyMobile = document.getElementById('fav-empty-mobile');

  var label = favorites.length + (favorites.length === 1 ? ' producto' : ' productos');
  if (favCountLabel)  favCountLabel.textContent  = label;
  if (favCountMobile) favCountMobile.textContent = label;

  if (favorites.length > 0) {
    if (favCountBadge)  { favCountBadge.style.display = 'flex'; favCountBadge.textContent = favorites.length; }
    if (favEmptyEl)     favEmptyEl.style.display     = 'none';
    if (favEmptyMobile) favEmptyMobile.style.display = 'none';
  } else {
    if (favCountBadge)  favCountBadge.style.display  = 'none';
    if (favEmptyEl)     favEmptyEl.style.display     = 'block';
    if (favEmptyMobile) favEmptyMobile.style.display = 'block';
  }

  if (favList) {
    Array.from(favList.children).forEach(function(c) {
      if (c.id !== 'fav-empty' && c.id !== 'fav-add-all') c.remove();
    });
    favorites.forEach(function(item) { favList.insertBefore(_buildFavRowCheckout(item, false), favEmptyEl); });
  }
  if (favListMobile) {
    Array.from(favListMobile.children).forEach(function(c) {
      if (c.id !== 'fav-empty-mobile') c.remove();
    });
    favorites.forEach(function(item) { favListMobile.insertBefore(_buildFavRowCheckout(item, true), favEmptyMobile); });
  }

  localStorage.setItem('hera_favs', JSON.stringify(favorites));
  var addAllEl = document.getElementById('fav-add-all');
  if (addAllEl) addAllEl.style.display = favorites.length > 0 ? 'block' : 'none';
}

function _buildFavRowCheckout(item, isMobile) {
  var row    = document.createElement('div');
  var nNivel = item.nivel || 'green';
  var nLabel = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nNivel] || 'En existencia';
  var volLine = item.vol ? '<div class="fav-row-vol">' + item.vol + '</div>' : '';
  row.dataset.favId = item.id;
  row.className = 'fav-row ' + (isMobile ? 'fav-row--mobile' : 'fav-row--desktop');
  row.innerHTML =
    '<div class="fav-row-img"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>' +
    '<div class="fav-row-body">' +
      '<div class="fav-row-nivel fav-row-nivel--' + nNivel + '"><span class="fav-row-nivel-dot"></span><span class="fav-row-nivel-label">' + nLabel + '</span></div>' +
      '<div class="fav-row-brand">' + item.brand + '</div>' +
      '<div class="fav-row-name">'  + item.name  + '</div>' +
      volLine +
      '<div class="fav-row-price">' + item.price + '</div>' +
    '</div>' +
    '<div class="fav-row-actions">' +
      '<button data-add-cart="' + item.id + '" class="fav-row-btn-cart" aria-label="Agregar al carrito"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></button>' +
      '<button data-remove="' + item.id + '" class="fav-row-btn-remove" aria-label="Quitar de favoritos"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
    '</div>';

  row.querySelector('[data-add-cart]').addEventListener('click', function(e) {
    e.stopPropagation();
    _addFavToCheckoutCart(item);
    var btn = this;
    btn.style.background = '#2e7d32';
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
    setTimeout(function() {
      btn.style.background = '';
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    }, 1200);
  });

  row.querySelector('[data-remove]').addEventListener('click', function(e) {
    e.stopPropagation();
    var id = e.currentTarget.dataset.remove;
    favorites = favorites.filter(function(f) { return f.id !== id; });
    localStorage.setItem('hera_favs', JSON.stringify(favorites));
    renderFavsCheckout();
  });

  return row;
}

function _addFavToCheckoutCart(item) {
  var existing = cartData.find(function(c) { return c.id === item.id; });
  if (existing) {
    existing.qty++;
  } else {
    cartData.push({ id: item.id, brand: item.brand, name: item.name, price: item.price, qty: 1 });
  }
  renderItems(); checkFreeShipping(); updateTotals(); updateNavBadge();
  if (discountAmount > 0) {
    discountAmount = 0;
    document.getElementById('promoInput').value = '';
    showToast('Carrito actualizado. Aplica el código de nuevo.', true);
    return;
  }
  showToast('Agregado al carrito.');
}

/* ══════════════════════════════════════
  CUSTOM SELECT — estados de México
══════════════════════════════════════ */
function _initCustomSelect() {
  var estados = ['Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Estado de México','Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'];
  var selectEl    = document.getElementById('estadoSelect');
  var trigger     = document.getElementById('estadoTrigger');
  var dropdown    = document.getElementById('estadoDropdown');
  var hiddenInput = document.getElementById('ck-estado');

  if (!selectEl) return;

  estados.forEach(function(name) {
    var opt = document.createElement('div');
    opt.className = 'custom-select-option';
    opt.textContent = name;
    opt.addEventListener('click', function() {
      hiddenInput.value = name;
      trigger.textContent = name;
      trigger.classList.remove('placeholder', 'error');
      dropdown.querySelectorAll('.custom-select-option').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      selectEl.classList.remove('open');
      trigger.appendChild(_createChevron());
      clrErr('ck-estado', 'err-estado');
    });
    dropdown.appendChild(opt);
  });

  trigger.addEventListener('click', function() { selectEl.classList.toggle('open'); });
  document.addEventListener('click', function(e) {
    if (!selectEl.contains(e.target)) selectEl.classList.remove('open');
  });
}

function _createChevron() {
  var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width','12'); s.setAttribute('height','12'); s.setAttribute('viewBox','0 0 24 24');
  s.setAttribute('fill','none'); s.setAttribute('stroke','currentColor'); s.setAttribute('stroke-width','2');
  var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'm6 9 6 6 6-6'); s.appendChild(p); return s;
}

/* ══════════════════════════════════════
  CART — cargar, renderizar, totales
══════════════════════════════════════ */
function loadCart() {
  try { var r = localStorage.getItem('hera_cart'); if (r) cartData = JSON.parse(r); } catch(e) { cartData = []; }
  /* ── TEMPORAL — datos demo cuando localStorage está vacío ── */
  if (!cartData || !cartData.length) {
    cartData = [
      { id:'jenny-1',     brand:'Jenny Rivera',        name:'Inolvidable EDP', price:'$1,210 MXN', qty: 2, nivel: 'green'  },
      { id:'fierce-2',    brand:'Abercrombie & Fitch',  name:'Fierce EDT',      price:'$786 MXN',   qty: 1, nivel: 'yellow' },
      { id:'signature-4', brand:'HERA Exclusivo',       name:'Signature Blanc', price:'$1,490 MXN', qty: 1, nivel: 'red'    },
    ];
  }
  if (!cartData.length) showEmpty(); else showCheckout();
}

function showEmpty() {
  document.getElementById('checkoutEmpty').style.display = 'flex';
  document.getElementById('checkoutFlow').style.display  = 'none';
  document.getElementById('pageHeader').style.display    = 'none';
}

function showCheckout() {
  document.getElementById('checkoutEmpty').style.display = 'none';
  document.getElementById('checkoutFlow').style.display  = 'block';
  document.getElementById('pageHeader').style.display    = 'flex';
  renderItems(); checkFreeShipping(); updateTotals(); updateNavBadge(); updatePayBtn();
}

function renderItems() {
  var c = document.getElementById('summaryItems');
  c.innerHTML = '';
  cartData.forEach(function(item, idx) {
    var u      = parseMXN(item.price);
    var t      = u * item.qty;
    var nNivel = item.nivel || 'green';
    var nLabel = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nNivel] || 'En existencia';
    var el = document.createElement('div');
    el.className = 'summary-item';
    el.innerHTML =
      '<div class="summary-item-img">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,0.2)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
        '<span class="item-qty-badge">' + item.qty + '</span>' +
      '</div>' +
      '<div class="summary-item-info">' +
        '<div class="summary-item-nivel summary-item-nivel--' + nNivel + '">' +
          '<span class="summary-item-nivel-dot"></span>' +
          '<span class="summary-item-nivel-label">' + nLabel + '</span>' +
        '</div>' +
        '<div class="summary-item-brand">' + item.brand + '</div>' +
        '<div class="summary-item-name">'  + item.name  + '</div>' +
        '<div class="summary-item-unit">'  + fmtMXN(u)  + ' c/u</div>' +
        '<div class="summary-item-actions">' +
          '<button class="summary-qty-btn" data-action="qty-minus" data-idx="' + idx + '">−</button>' +
          '<div class="summary-qty-val">' + item.qty + '</div>' +
          '<button class="summary-qty-btn" data-action="qty-plus"  data-idx="' + idx + '">+</button>' +
          '<button class="summary-remove"  data-action="remove"    data-idx="' + idx + '">Eliminar</button>' +
        '</div>' +
      '</div>' +
      '<div class="summary-item-right">' +
        '<div class="summary-item-total">' + fmtMXN(t) + '</div>' +
      '</div>';
    c.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var summaryItems = document.getElementById('summaryItems');
  if (summaryItems) {
    summaryItems.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.dataset.action;
      var idx    = parseInt(btn.dataset.idx);
      if (action === 'qty-minus') {
        cartData[idx].qty = Math.max(1, cartData[idx].qty - 1);
        renderItems(); checkFreeShipping(); updateTotals(); updateNavBadge();
        if (discountAmount > 0) { discountAmount = 0; document.getElementById('promoInput').value = ''; showToast('Descuento recalculado. Aplica el código de nuevo.', true); }
      } else if (action === 'qty-plus') {
        cartData[idx].qty++;
        renderItems(); checkFreeShipping(); updateTotals(); updateNavBadge();
        if (discountAmount > 0) { discountAmount = 0; document.getElementById('promoInput').value = ''; }
      } else if (action === 'remove') {
        cartData.splice(idx, 1);
        if (!cartData.length) { showEmpty(); return; }
        renderItems(); checkFreeShipping(); updateTotals(); updateNavBadge();
        if (discountAmount > 0) { discountAmount = 0; document.getElementById('promoInput').value = ''; }
      }
    });
  }
});

function getSub() { return cartData.reduce(function(s, i) { return s + parseMXN(i.price) * i.qty; }, 0); }
function getQty() { return cartData.reduce(function(s, i) { return s + i.qty; }, 0); }

function checkFreeShipping() {
  var sub      = getSub();
  var freeOpt  = document.getElementById('shippingFreeOption');
  var noticeEl = document.getElementById('shippingNotice');
  if (sub >= FREE_SHIPPING) {
    freeOpt.style.display  = 'flex';
    noticeEl.style.display = 'flex';
    selectShipping(freeOpt);
  } else {
    freeOpt.style.display  = 'none';
    noticeEl.style.display = 'none';
    if (shippingCost === 0) selectShipping(document.querySelector('[data-shipping="standard"]'));
  }
}

function updateTotals() {
  var sub   = getSub();
  var qty   = getQty();
  var total = sub - discountAmount + shippingCost;
  document.getElementById('valSubtotal').textContent  = fmtMXN(sub);
  document.getElementById('summaryCount').textContent = '(' + qty + (qty === 1 ? ' artículo' : ' artículos') + ')';
  var sEl      = document.getElementById('valShipping');
  var selShip  = document.querySelector('.shipping-option.selected');
  var shipType = selShip ? selShip.dataset.shipping : '';
  var isPending = (shippingCost === 0 && shipType !== 'free' && shipType !== 'gdl' && shipType !== '');
  if (isPending)               { sEl.textContent = 'Por confirmar'; sEl.className = 'total-value'; }
  else if (shippingCost === 0) { sEl.textContent = 'Gratis';        sEl.className = 'total-value free'; }
  else                         { sEl.textContent = fmtMXN(shippingCost); sEl.className = 'total-value'; }
  document.getElementById('valDiscount').textContent = discountAmount > 0 ? '−' + fmtMXN(discountAmount) : '$0.00 MXN';
  document.getElementById('valTotal').textContent    = fmtMXN(total);
  document.getElementById('payBtnText').textContent  = 'Pagar ahora — ' + fmtMXN(total);
}

function updateNavBadge() {
  var q = getQty();
  if (cartBadge) {
    cartBadge.textContent   = q;
    cartBadge.style.display = q > 0 ? 'flex' : 'none';
  }
}

function updatePayBtn() {
  var btn = document.getElementById('payBtn');
  if (currentStep >= 3) btn.classList.add('ready');
  else                  btn.classList.remove('ready');
}

/* ══════════════════════════════════════
  MULTI-STEP NAVIGATION
══════════════════════════════════════ */
function _initStepNav() {
  document.getElementById('btnStep1Next').addEventListener('click', function() { nextStep(1); });
  document.getElementById('btnStep2Back').addEventListener('click', function() { goToStep(1); });
  document.getElementById('btnStep2Next').addEventListener('click', function() { nextStep(2); });
  document.getElementById('btnStep3Back').addEventListener('click', function() { goToStep(2); });
  document.getElementById('btnBackToCatalog').addEventListener('click', function() { window.location.href = 'catalogo.html'; });
  document.getElementById('payBtn').addEventListener('click', submitCheckout);
  document.getElementById('promoBtn').addEventListener('click', applyPromo);

  for (var i = 1; i <= 4; i++) {
    (function(n) {
      var stepEl = document.getElementById('step' + n);
      if (stepEl) stepEl.addEventListener('click', function() { goToStep(n); });
    })(i);
  }
}

function showPanel(n) {
  document.querySelectorAll('.step-panel').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById('panel' + n);
  if (panel) { panel.classList.remove('active'); void panel.offsetWidth; panel.classList.add('active'); }
  updateStepIndicator(n); currentStep = n; updatePayBtn();
  document.getElementById('formArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStepIndicator(active) {
  for (var i = 1; i <= 4; i++) {
    var s = document.getElementById('step' + i);
    if (!s) continue;
    s.className = 'step';
    if (i < active)        s.className = 'step done';
    else if (i === active) s.className = 'step active';
  }
}

function goToStep(n)    { if (n <= maxStepReached) showPanel(n); }
function nextStep(from) {
  if (from === 1 && !validateStep1()) return;
  if (from === 2 && !validateStep2()) return;
  var next = from + 1;
  if (next > maxStepReached) maxStepReached = next;
  showPanel(next);
}

/* ══════════════════════════════════════
  VALIDACIÓN
══════════════════════════════════════ */
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v) { return /^[\d\s+()-]{7,}$/.test(v); }

function setErr(inputId, errId) {
  var inp = document.getElementById(inputId);
  var err = document.getElementById(errId);
  if (inp) inp.classList.add('error');
  if (err) err.classList.add('show');
}

function clrErr(inputId, errId) {
  var inp = document.getElementById(inputId);
  var err = document.getElementById(errId);
  if (inp) inp.classList.remove('error');
  if (err) err.classList.remove('show');
}

function _initFormListeners() {
  var fm = {
    'ck-nombre':    'err-nombre',
    'ck-apellidos': 'err-apellidos',
    'ck-telefono':  'err-telefono',
    'ck-email':     'err-email',
    'ck-calle':     'err-calle',
    'ck-ciudad':    'err-ciudad',
    'ck-estado':    'err-estado',
    'ck-cp':        'err-cp'
  };
  Object.keys(fm).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input',  function() { clrErr(id, fm[id]); });
      el.addEventListener('change', function() { clrErr(id, fm[id]); });
    }
  });
}

function validateStep1() {
  var ok = true;
  ['ck-nombre','ck-apellidos','ck-telefono','ck-email'].forEach(function(id) {
    clrErr(id, 'err-' + id.replace('ck-',''));
  });
  if (!document.getElementById('ck-nombre').value.trim())    { setErr('ck-nombre','err-nombre');       ok = false; }
  if (!document.getElementById('ck-apellidos').value.trim()) { setErr('ck-apellidos','err-apellidos'); ok = false; }
  if (!isPhone(document.getElementById('ck-telefono').value)){ setErr('ck-telefono','err-telefono');   ok = false; }
  if (!isEmail(document.getElementById('ck-email').value))   { setErr('ck-email','err-email');         ok = false; }
  if (!ok) { var f = document.querySelector('#panel1 .form-input.error'); if (f) f.focus(); showToast('Completa los campos de contacto.', true); }
  return ok;
}

function validateStep2() {
  var ok = true;
  if (!document.getElementById('ck-calle').value.trim())  { setErr('ck-calle','err-calle');   ok = false; }
  if (!document.getElementById('ck-ciudad').value.trim()) { setErr('ck-ciudad','err-ciudad'); ok = false; }
  if (!document.getElementById('ck-estado').value)        { setErr('ck-estado','err-estado'); document.getElementById('estadoTrigger').classList.add('error'); ok = false; }
  if (!document.getElementById('ck-cp').value.trim())     { setErr('ck-cp','err-cp');         ok = false; }
  if (!ok) showToast('Completa los campos de envío.', true);
  return ok;
}

/* ══════════════════════════════════════
  SHIPPING
══════════════════════════════════════ */
function _initShipping() {
  document.getElementById('shippingOptions').addEventListener('click', function(e) {
    var opt = e.target.closest('.shipping-option');
    if (opt) selectShipping(opt);
  });

  var cpLookupTimer = null;
  document.getElementById('ck-cp').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').substring(0,5);
    var cp   = this.value;
    var hint = document.getElementById('cpHint');
    clearTimeout(cpLookupTimer);
    if (cp.length < 5) {
      hint.className   = 'cp-hint';
      hint.textContent = cp.length > 0 ? 'Faltan ' + (5 - cp.length) + ' dígito' + (5 - cp.length === 1 ? '' : 's') + '…' : 'Ingresa tu CP para ver las paqueterías disponibles.';
      resetCarriersUI();
      return;
    }
    hint.className   = 'cp-hint searching';
    hint.textContent = 'Buscando paqueterías para ' + cp + '…';
    cpLookupTimer = setTimeout(function(){ loadCarriers(cp); }, 400);
  });
}

function selectShipping(el) {
  document.querySelectorAll('.shipping-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  shippingCost = parseInt(el.dataset.cost) || 0;
  updateTotals();
}

function resetCarriersUI() {
  document.getElementById('carriersLoading').classList.remove('active');
  document.getElementById('carriersError').classList.remove('active');
  document.getElementById('shippingCostNote').classList.remove('active');
  var container = document.getElementById('shippingOptions');
  Array.from(container.children).forEach(function(c) {
    if (c.dataset.dynamic) c.remove();
  });
  var standard = container.querySelector('[data-shipping="standard"]');
  if (standard) selectShipping(standard);
}

function loadCarriers(cp) {
  /* ── TEMPORAL — simulación de paqueterías por CP
    Reemplazar por fetch('/api/carriers?cp=' + cp) cuando el backend esté disponible.
    El backend debe devolver: [{ name, service, eta, cost }]
  ── */
  document.getElementById('carriersLoading').classList.add('active');
  document.getElementById('carriersError').classList.remove('active');

  setTimeout(function() {
    document.getElementById('carriersLoading').classList.remove('active');
    var isGDL = ['44100','44200','44300','44400','44500','44600','44700','44800','44900','45000','45010','45020','45030','45040','45050','45060','45070','45080','45090','45100','45110','45120','45130','45140','45150','45200','45400','45500','45600','45650','45670','45900','44160'].includes(cp);
    var carriers = [
      { name: 'Skydropx',  service: 'Express',   eta: '2–3 días hábiles', cost: 99  },
      { name: 'DHL',       service: 'Estándar',   eta: '3–5 días hábiles', cost: 149 },
    ];
    showCarriers(carriers, isGDL);
    var hint = document.getElementById('cpHint');
    hint.className   = 'cp-hint valid';
    hint.textContent = 'CP ' + cp + ' — paqueterías disponibles arriba.';
  }, 800);
}

function showCarriers(carriers, showGDL) {
  var container = document.getElementById('shippingOptions');
  Array.from(container.children).forEach(function(c) { if (c.dataset.dynamic) c.remove(); });

  carriers.forEach(function(c) {
    var div = document.createElement('div');
    div.className = 'shipping-option';
    div.dataset.shipping = c.name.toLowerCase();
    div.dataset.cost     = c.cost;
    div.dataset.dynamic  = '1';
    div.innerHTML =
      '<div class="ship-radio"><div class="ship-dot"></div></div>' +
      '<div class="shipping-details">' +
        '<div class="shipping-name">' + c.name + ' — ' + c.service + '</div>' +
        '<div class="shipping-desc">' + c.eta + '</div>' +
      '</div>' +
      '<div class="shipping-price shipping-price--pending">Por confirmar</div>';
    container.appendChild(div);
  });

  if (showGDL) {
    var gdlDiv = document.createElement('div');
    gdlDiv.className = 'shipping-option';
    gdlDiv.dataset.shipping = 'gdl';
    gdlDiv.dataset.cost     = 0;
    gdlDiv.dataset.dynamic  = '1';
    gdlDiv.innerHTML =
      '<div class="ship-radio"><div class="ship-dot"></div></div>' +
      '<div class="shipping-details">' +
        '<div class="shipping-name">Entrega en GDL — Casa Blanca</div>' +
        '<div class="shipping-desc">Retiro en sucursal · Disponible a partir del día hábil siguiente</div>' +
      '</div>' +
      '<div class="shipping-price free-tag">Sin costo</div>';
    container.appendChild(gdlDiv);
  }

  document.getElementById('shippingCostNote').classList.add('active');
  shippingCost = 0;
  updateTotals();
}

/* ══════════════════════════════════════
  PAYMENT
══════════════════════════════════════ */
function _initPayment() {
  document.getElementById('paymentMethods').addEventListener('click', function(e) {
    var opt = e.target.closest('.payment-option');
    if (opt) selectPayment(opt);
  });

  document.getElementById('cardnum').addEventListener('input', function() {
    var v = this.value.replace(/\D/g,'').substring(0,16);
    this.value = v.replace(/(.{4})/g,'$1 ').trim();
  });
  document.getElementById('expiry').addEventListener('input', function() {
    var v = this.value.replace(/\D/g,'').substring(0,4);
    if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
    this.value = v;
  });
  document.getElementById('cvv').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').substring(0,4);
  });
}

function selectPayment(el) {
  document.querySelectorAll('.payment-option').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  document.getElementById('cardPanel').classList.remove('show');
  document.getElementById('paypalPanel').classList.remove('show');
  document.getElementById('transferPanel').classList.remove('show');
  var method = el.dataset.method;
  if (method === 'card')          document.getElementById('cardPanel').classList.add('show');
  else if (method === 'paypal')   document.getElementById('paypalPanel').classList.add('show');
  else if (method === 'transfer') document.getElementById('transferPanel').classList.add('show');
}

/* ══════════════════════════════════════
  PROMO
══════════════════════════════════════ */
function applyPromo() {
  var code = document.getElementById('promoInput').value.trim().toUpperCase();
  if (!code) { showToast('Ingresa un código promocional.', true); return; }
  if      (code === 'HERA10') { discountAmount = Math.round(getSub() * 0.10); updateTotals(); showToast('¡Código aplicado! 10% de descuento.'); }
  else if (code === 'HERA20') { discountAmount = Math.round(getSub() * 0.20); updateTotals(); showToast('¡Código aplicado! 20% de descuento.'); }
  else                        { showToast('Código no válido.', true); }
}

/* ══════════════════════════════════════
  SUBMIT
══════════════════════════════════════ */
var pTimer = null;
function submitCheckout() {
  if (currentStep < 3) { showToast('Completa todos los pasos primero.', true); return; }
  var btn = document.getElementById('payBtn');
  var txt = document.getElementById('payBtnText');
  btn.disabled = true;
  var d = 0;
  pTimer = setInterval(function() { d = (d + 1) % 4; txt.textContent = 'PROCESANDO' + '.'.repeat(d); }, 380);
  updateStepIndicator(4);
  setTimeout(function() {
    clearInterval(pTimer); btn.disabled = false;
    txt.textContent = 'Pagar ahora — ' + document.getElementById('valTotal').textContent;
    var orderNum  = 'HERA-' + (Date.now().toString(36) + Math.random().toString(36).slice(2,6)).toUpperCase().slice(0,8);
    var selMethod = document.querySelector('.payment-option.selected');
    var orderData = {
      orderNum:  orderNum,
      fecha:     new Date().toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' }),
      nombre:    document.getElementById('ck-nombre').value.trim() + ' ' + document.getElementById('ck-apellidos').value.trim(),
      email:     document.getElementById('ck-email').value.trim(),
      telefono:  document.getElementById('ck-telefono').value.trim(),
      metodo:    selMethod ? selMethod.dataset.method : 'card',
      total:     document.getElementById('valTotal').textContent,
      descuento: document.getElementById('valDiscount').textContent,
      envio:     document.getElementById('valShipping').textContent,
      items:     cartData,
      direccion: {
        calle:  document.getElementById('ck-calle').value.trim(),
        ciudad: document.getElementById('ck-ciudad').value.trim(),
        estado: document.getElementById('ck-estado').value,
        cp:     document.getElementById('ck-cp').value.trim()
      }
    };
    try { localStorage.setItem('hera_last_order', JSON.stringify(orderData)); } catch(e) {}
    localStorage.removeItem('hera_cart');
    window.location.href = 'confirmacion.html';
  }, 2200);
}

/* ══════════════════════════════════════
  TOAST
══════════════════════════════════════ */
function showToast(msg, isErr) {
  var old = document.querySelector('.toast'); if (old) old.remove();
  var t = document.createElement('div');
  t.className   = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.classList.add('show'); });
  setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 3000);
}

/* ══════════════════════════════════════
  SCROLL REVEAL
══════════════════════════════════════ */
function _initScrollReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) e.target.classList.add('visible');
      else e.target.classList.remove('visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}

/* ── Utilidades ─────────────────────────────────────────────── */
function parseMXN(s) { return parseInt(String(s).replace(/[^0-9]/g, '')) || 0; }
function fmtMXN(n)   { return '$' + n.toLocaleString('es-MX') + ' MXN'; }
