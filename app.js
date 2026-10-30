const products = [
  {id:1,name:"Sunday Slowdown",category:"beans",type:"Whole beans · 250g",price:549,tag:"BESTSELLER",description:"Chocolate, hazelnut & a little caramel.",rating:"4.9",image:"https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=700&q=85"},
  {id:2,name:"Golden Hour",category:"ground",type:"Ground coffee · 250g",price:499,tag:"SMOOTH & SWEET",description:"Soft citrus, honey and a warm finish.",rating:"4.8",image:"https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=85"},
  {id:3,name:"Midnight Ritual",category:"beans",type:"Whole beans · 250g",price:599,tag:"DARK ROAST",description:"Deep cocoa, toasted nuts & bold comfort.",rating:"4.9",image:"https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=700&q=85"},
  {id:4,name:"The Daily Drip",category:"ground",type:"Ground coffee · 200g",price:399,tag:"EVERYDAY FAVOURITE",description:"Balanced, easy-going and ready for mornings.",rating:"4.7",image:"https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=700&q=85"},
  {id:5,name:"Little Latte",category:"ready",type:"Cold coffee · 250ml",price:189,tag:"CHILL PICK",description:"Creamy, mellow and ready when you are.",rating:"4.8",image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=85"},
  {id:6,name:"Cloud Nine Cold Brew",category:"ready",type:"Cold brew · 250ml",price:219,tag:"CHILLED & CHEERFUL",description:"Slow-steeped, smooth and wonderfully bright.",rating:"4.9",image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=85"}
];

const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);
let activeCategory = "all";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("brewBeanCart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("brewBeanWishlist") || "[]");
let toastTimer;

const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartSummary = document.getElementById("cartSummary");
const modalBackdrop = document.getElementById("modalBackdrop");

function renderProducts(){
  const shown = products.filter(p => (activeCategory === "all" || p.category === activeCategory) && `${p.name} ${p.description} ${p.type}`.toLowerCase().includes(searchTerm));
  document.getElementById("productCount").textContent = `${shown.length} ${shown.length === 1 ? "coffee favourite" : "coffee favourites"}`;
  if(!shown.length){productGrid.innerHTML='<div class="no-results"><strong>No brews found just yet.</strong>Try another search or category.</div>';return;}
  productGrid.innerHTML = shown.map(p=>`
    <article class="product-card">
      <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=700&q=80'">
        <span class="product-tag">${p.tag}</span>
        <button class="wishlist-button ${wishlist.includes(p.id)?"saved":""}" data-wishlist="${p.id}" aria-label="${wishlist.includes(p.id)?"Remove from":"Add to"} wishlist">${wishlist.includes(p.id)?"♥":"♡"}</button>
        <button class="quick-add" data-add="${p.id}">Add to bag — ${money(p.price)} <span>＋</span></button>
      </div>
      <div class="product-info"><p class="product-category">${p.type}</p><div class="product-name-line"><h3 class="product-name">${p.name}</h3><span class="product-price">${money(p.price)}</span></div><p class="product-description">${p.description}</p><div class="product-rating"><span>★★★★★</span> ${p.rating} · customer favourite</div></div>
    </article>`).join("");
}
function persistCart(){localStorage.setItem("brewBeanCart",JSON.stringify(cart));renderCart();}
function cartTotal(){return cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0);}
function renderCart(){
  const count=cart.reduce((sum,item)=>sum+item.qty,0), total=cartTotal();
  document.getElementById("cartCount").textContent=count;
  document.getElementById("drawerCount").textContent=`(${count})`;
  document.getElementById("cartSubtotal").textContent=money(total);
  document.getElementById("checkoutTotal").textContent=money(total);
  emptyCart.classList.toggle("visible",count===0);
  cartSummary.classList.toggle("hidden",count===0);
  cartItems.style.display=count===0?"none":"block";
  cartItems.innerHTML=cart.map(item=>{const p=products.find(product=>product.id===item.id);return `<article class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${p.type}</p><div class="quantity-control"><button data-qty="${p.id}" data-change="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-change="1" aria-label="Increase ${p.name} quantity">＋</button></div><button class="remove-item" data-remove="${p.id}">Remove</button></div><span class="cart-item-price">${money(p.price*item.qty)}</span></article>`}).join("");
  const remaining=Math.max(999-total,0);
  document.getElementById("shippingMessage").textContent=remaining===0?"Lovely! You've unlocked free delivery.":`You're ${money(remaining)} away from free delivery!`;
  document.getElementById("shippingProgress").style.width=`${Math.min(total/999*100,100)}%`;
}
function saveWishlist(){localStorage.setItem("brewBeanWishlist",JSON.stringify(wishlist));}
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("show");cartDrawer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("show");cartDrawer.setAttribute("aria-hidden","true");document.body.style.overflow="";}
function addToCart(id){const item=cart.find(i=>i.id===id);if(item)item.qty++;else cart.push({id,qty:1});persistCart();showToast(`${products.find(p=>p.id===id).name} added to your bag ☕`);}
function changeQuantity(id,change){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=change;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);persistCart();}
function toggleWishlist(id){wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];saveWishlist();renderProducts();showToast(wishlist.includes(id)?"Saved to your wishlist ♥":"Removed from your wishlist");}

document.getElementById("filters").addEventListener("click",e=>{const button=e.target.closest("[data-category]");if(!button)return;activeCategory=button.dataset.category;document.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("active",b===button));renderProducts();});
document.getElementById("productSearch").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderProducts();});
document.getElementById("searchToggle").addEventListener("click",()=>{document.getElementById("productSearch").focus();document.getElementById("shop").scrollIntoView({behavior:"smooth"});});
productGrid.addEventListener("click",e=>{const add=e.target.closest("[data-add]");const wish=e.target.closest("[data-wishlist]");if(add)addToCart(Number(add.dataset.add));if(wish)toggleWishlist(Number(wish.dataset.wishlist));});
cartItems.addEventListener("click",e=>{const qty=e.target.closest("[data-qty]");const remove=e.target.closest("[data-remove]");if(qty)changeQuantity(Number(qty.dataset.qty),Number(qty.dataset.change));if(remove){cart=cart.filter(i=>i.id!==Number(remove.dataset.remove));persistCart();}});
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
document.getElementById("startShopping").addEventListener("click",()=>{closeCart();document.getElementById("shop").scrollIntoView({behavior:"smooth"});});
overlay.addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeCheckout();}});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("mainNav").classList.remove("open")));

function openCheckout(){if(!cart.length){showToast("Your bag is empty. Find a brew you love first!");return;}closeCart();modalBackdrop.classList.add("show");document.body.style.overflow="hidden";}
function closeCheckout(){modalBackdrop.classList.remove("show");if(!cartDrawer.classList.contains("open"))document.body.style.overflow="";}
document.getElementById("checkoutButton").addEventListener("click",openCheckout);
document.getElementById("closeCheckout").addEventListener("click",closeCheckout);
modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop)closeCheckout();});
document.getElementById("checkoutForm").addEventListener("submit",e=>{e.preventDefault();const form=new FormData(e.target);const orderId="BB"+Math.floor(100000+Math.random()*900000);const name=String(form.get("name")).trim();cart=[];persistCart();e.target.reset();closeCheckout();showToast(`Thank you, ${name}! Demo order ${orderId} placed ☕`);});
document.getElementById("newsletterForm").addEventListener("submit",e=>{e.preventDefault();const email=document.getElementById("emailInput").value;document.getElementById("newsletterMessage").textContent=`You're on the list! Coffee notes will find ${email}.`;e.target.reset();showToast("You're on the list. Thanks for joining us!");});

renderProducts();renderCart();