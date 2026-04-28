/**
 * catalog.js — HERA
 *
 * Descripción: Catálogo de productos hardcodeado temporalmente.
 *              Fuente de verdad para el search overlay del navbar,
 *              el carrusel de bestsellers, las novedades editoriales
 *              y la hero card del index.
 * Exporta:     CATALOG
 * Importado por: js/components/navbar.js, js/pages/index.js
 *
 * Flags de sección:
 *   heroDestacado — producto que aparece en la hero card del index
 *   bestSeller    — productos que aparecen en el carrusel de bestsellers
 *   nuevo         — productos que aparecen en el grid de novedades
 *
 * ── TEMPORAL — reemplazar por fetch cuando el backend esté disponible.
 *    Endpoint esperado: GET /api/productos
 */

export const CATALOG = [
  { id:'jenny-1',      brand:'Jenny Rivera',        name:'Inolvidable EDP',    price:'$1,210 MXN', precio:1210, badge:'Más vendido',  cat:'diseñador', gen:'femenino',  fam:'floral',    marca:'jenny-rivera',     nuevo:false, tipo:'perfumes', nivel:'green',  heroDestacado:true,  bestSeller:true,  vols:[{ml:50,precio:1210},{ml:100,precio:1890}] },
  { id:'fierce-2',     brand:'Abercrombie & Fitch', name:'Fierce EDT',         price:'$760 MXN',   precio:760,  badge:'',            cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'abercrombie',      nuevo:false, tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:true,  vols:[{ml:50,precio:760},{ml:100,precio:1180},{ml:200,precio:1740}] },
  { id:'authentic-3',  brand:'Abercrombie & Fitch', name:'Authentic EDP',      price:'$975 MXN',   precio:975,  badge:'Ed. limitada', cat:'diseñador', gen:'unisex',   fam:'amaderado', marca:'abercrombie',      nuevo:false, tipo:'perfumes', nivel:'yellow', heroDestacado:false, bestSeller:true,  vols:[{ml:50,precio:975},{ml:100,precio:1540}] },
  { id:'signature-4',  brand:'HERA Exclusivo',      name:'Signature Blanc',    price:'$1,490 MXN', precio:1490, badge:'Nuevo',        cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:true,  tipo:'perfumes', nivel:'yellow', heroDestacado:false, bestSeller:true,  vols:[{ml:50,precio:1490},{ml:100,precio:2280}] },
  { id:'noir-5',       brand:'HERA Exclusivo',      name:'Noir Absolu',        price:'$1,480 MXN', precio:1480, badge:'-20%',         cat:'nicho',     gen:'masculino', fam:'oriental',  marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'yellow', heroDestacado:false, bestSeller:false, vols:[{ml:50,precio:1480},{ml:100,precio:2200}] },
  { id:'oud-6',        brand:'HERA Árabe',          name:'Oud Rose',           price:'$1,320 MXN', precio:1320, badge:'',            cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',       nuevo:false, tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:false, vols:[{ml:30,precio:1320},{ml:50,precio:1890}] },
  { id:'sauvage-7',    brand:'Dior',                name:'Sauvage EDP',        price:'$2,450 MXN', precio:2450, badge:'Más vendido',  cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'dior',             nuevo:false, tipo:'perfumes', nivel:'red',    heroDestacado:false, bestSeller:false, vols:[{ml:60,precio:1850},{ml:100,precio:2450},{ml:200,precio:3100}] },
  { id:'blanche-8',    brand:'Byredo',              name:'Blanche EDP',        price:'$2,100 MXN', precio:2100, badge:'',            cat:'nicho',     gen:'femenino',  fam:'floral',    marca:'byredo',           nuevo:false, tipo:'perfumes', nivel:'red',    heroDestacado:false, bestSeller:false, vols:[{ml:50,precio:2100},{ml:100,precio:3400}] },
  { id:'lune-9',       brand:'HERA Árabe',          name:"Lune d'Orient",      price:'$1,580 MXN', precio:1580, badge:'',            cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',       nuevo:false, tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:false, vols:[{ml:30,precio:1580},{ml:50,precio:2200}] },
  { id:'rose-10',      brand:'HERA Árabe',          name:'Rose Majlis',        price:'$1,290 MXN', precio:1290, badge:'Nuevo',        cat:'arabes',    gen:'femenino',  fam:'floral',    marca:'hera-arabe',       nuevo:true,  tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:false, vols:[{ml:30,precio:1290},{ml:50,precio:1820}] },
  { id:'velvet-11',    brand:'HERA Exclusivo',      name:'Velvet Oud',         price:'$1,680 MXN', precio:1680, badge:'',            cat:'nicho',     gen:'unisex',   fam:'oriental',  marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'yellow', heroDestacado:false, bestSeller:false, vols:[{ml:50,precio:1680},{ml:100,precio:2590}] },
  { id:'set-1',        brand:'HERA Exclusivo',      name:'Gift Set Signature', price:'$2,200 MXN', precio:2200, badge:'Nuevo',        cat:'sets',      gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:true,  tipo:'perfumes', nivel:'red',    heroDestacado:false, bestSeller:false, vols:[{ml:100,precio:2200}] },
  { id:'amber-12',     brand:'Jenny Rivera',        name:'Amber Eterno EDP',   price:'$1,050 MXN', precio:1050, badge:'',            cat:'diseñador', gen:'femenino',  fam:'oriental',  marca:'jenny-rivera',     nuevo:false, tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:false, vols:[{ml:50,precio:1050},{ml:100,precio:1680}] },
  { id:'silver-13',    brand:'HERA Exclusivo',      name:'Silver Iris EDP',    price:'$1,750 MXN', precio:1750, badge:'',            cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'red',    heroDestacado:false, bestSeller:false, vols:[{ml:50,precio:1750},{ml:100,precio:2690}] },
  { id:'bm-1',         brand:"Victoria's Secret",  name:'Bombshell BM',       price:'$520 MXN',   precio:520,  badge:'Nuevo',        cat:'body-mist', gen:'femenino',  fam:'floral',    marca:'victorias-secret', nuevo:true,  tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:false, vols:[{ml:250,precio:520}] },
  { id:'bm-2',         brand:'Bath & Body Works',  name:'Japanese Cherry BM', price:'$480 MXN',   precio:480,  badge:'',            cat:'body-mist', gen:'femenino',  fam:'floral',    marca:'bbw',              nuevo:false, tipo:'perfumes', nivel:'green',  heroDestacado:false, bestSeller:false, vols:[{ml:236,precio:480}] },
  { id:'anillo-1',     brand:'HERA Joyería',       name:'Anillo Solitario',   price:'$1,290 MXN', precio:1290, badge:'Nuevo',        cat:'anillos',   gen:'femenino',  fam:'',          marca:'hera-joyeria',     nuevo:true,  tipo:'joyeria',  nivel:'yellow', heroDestacado:false, bestSeller:true,  vols:[{ml:'5',precio:1290},{ml:'6',precio:1290},{ml:'7',precio:1290},{ml:'8',precio:1290},{ml:'9',precio:1350}], volLabel:'Talla', masVariantes:true },
  { id:'aretes-1',     brand:'HERA Joyería',       name:'Aretes Perla',       price:'$680 MXN',   precio:680,  badge:'',            cat:'aretes',    gen:'femenino',  fam:'',          marca:'hera-joyeria',     nuevo:false, tipo:'joyeria',  nivel:'yellow', heroDestacado:false, bestSeller:false, vols:[{ml:'Plata .925',precio:680},{ml:'Oro 14k',precio:980}], volLabel:'Material', masVariantes:false },
  { id:'collar-1',     brand:'HERA Joyería',       name:'Collar Dorado',      price:'$890 MXN',   precio:890,  badge:'',            cat:'collares',  gen:'unisex',   fam:'',          marca:'hera-joyeria',     nuevo:false, tipo:'joyeria',  nivel:'yellow', heroDestacado:false, bestSeller:true,  vols:[{ml:'40 cm',precio:890},{ml:'45 cm',precio:890},{ml:'50 cm',precio:920}], volLabel:'Largo', masVariantes:false },
  { id:'brazalete-1',  brand:'HERA Joyería',       name:'Brazalete Minimal',  price:'$750 MXN',   precio:750,  badge:'Nuevo',        cat:'brazaletes',gen:'unisex',   fam:'',          marca:'hera-joyeria',     nuevo:true,  tipo:'joyeria',  nivel:'red',    heroDestacado:false, bestSeller:false, vols:[{ml:'Plata .925',precio:750},{ml:'Oro 18k',precio:1200}], volLabel:'Material', masVariantes:false },
];