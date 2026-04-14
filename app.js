let loaded = false
const auth = firebase.auth();
const db = firebase.firestore();
let unsubscribe;

const whenSignedIn = document.getElementById("whenSignedIn");
const whenSignedOut = document.getElementById("whenSignedOut");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const provider = new firebase.auth.GoogleAuthProvider();
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();
displayCategories();
getPopular();

auth.onAuthStateChanged(user => {

    if(user){
        whenSignedIn.classList.remove("hidden");
        signInBtn.classList.add("hidden");
        document.getElementById("userPhoto").src = user.photoURL;
        document.querySelectorAll(".save-btn").forEach(btn => btn.hidden = false);
    }

    else{
        whenSignedIn.classList.add("hidden");
        signInBtn.classList.remove("hidden");
        document.querySelectorAll(".save-btn").forEach(btn => btn.hidden = true);

        if (unsubscribe) unsubscribe();
    }
});

//display categories
const categoriesContainer = document.getElementById("categories");
async function displayCategories(){
    try{
        const api = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
        const categoriesData = await api.json();
        for (const category of categoriesData.categories){
            const categoryElement = document.createElement("div");
            categoryElement.className = "px-4 py-2 bg-stone-900 rounded-full text-sm text-stone-100 cursor-pointer hover:bg-orange-600 transition-colors duration-200";
            categoryElement.textContent = category.strCategory;
            categoryElement.onclick = () => {
                const isActive = categoryElement.classList.contains("bg-orange-600");
                document.querySelectorAll("#categories div").forEach(el => el.classList.remove("bg-orange-600"));
                if (isActive) {
                    getPopular();
                } else {
                    categoryElement.classList.add("bg-orange-600");
                    filterByCategory(category.strCategory);
                }
            };
            categoriesContainer.appendChild(categoryElement);
        }
    }
    catch(error){console.log(error);}
}

async function filterByCategory(category){
    const display = document.getElementById("display");
    try{
        const categoryApi = await fetch (`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const categorizedData = await categoryApi.json(); 
        display.innerHTML = "";
        document.getElementById("heading").textContent = `"${category}" Recipes`;

        for (const recipe of categorizedData.meals) {
            display.appendChild(createStandardCard(recipe));
        }

    }
    catch(error){console.log(error);}
}


async function fetchRecipe(){
    if (!loaded) return; 
    try{
        const search = document.getElementById("search").value;
        const display = document.getElementById("display")
        
        if(!search) return;
        else  document.getElementById("heading").textContent = `Recipes with "${search}"`;

        const api = await fetch (`https://www.themealdb.com/api/json/v1/1/filter.php?i=${search}`);
        if(!api.ok){throw new Error("couldnt fetch api");}
        const data = await api.json();

        display.innerHTML = ""; 
        for (const recipe of data.meals) {
            display.appendChild(createStandardCard(recipe));
        }
        
    }

    catch(error){console.log(error);}
}

async function getPopular(){
    loaded = true;
    try{
        const display = document.getElementById("display");
        document.getElementById("heading").textContent = "Random Popular Recipes";
        const meals = [];
        for(let i = 0; i < 8; i++){
            const popularApi = await fetch (`https://www.themealdb.com/api/json/v1/1/random.php`)
            const popularData = await popularApi.json();
            meals.push(popularData.meals[0]);
        }

        display.innerHTML = "";
        for (const meal of meals) {
            display.appendChild(createOverlayCard(meal));
        }
        
    }
    catch(error){console.log(error);}

}

function saveRecipe(id){
    const user = auth.currentUser;
    db.collection("meals").add({
        uid: user.uid,
        mealID: id,
    });
}

function createOverlayCard(meal) {
    const card = document.createElement("div");
    card.className = "group relative bg-stone-900 rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1";
    card.innerHTML = `
        <div class="overflow-hidden">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
            <h3 class="text-white text-sm font-medium leading-snug line-clamp-2">${meal.strMeal}</h3>
            <button onclick="window.location.href='recipe.html?id=${meal.idMeal}'" class="shrink-0 text-xs font-medium text-stone-900 bg-white px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-200">View →</button>
            <button class="save-btn shrink-0 text-xs font-medium text-stone-900 bg-white px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-200" onclick="saveRecipe('${meal.idMeal}')">Save</button>
        </div>
    `;
    card.querySelector(".save-btn").hidden = !auth.currentUser;
    return card;
}

function createStandardCard(meal) {
    const card = document.createElement("div");
    card.className = "card bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 cursor-pointer";
    card.innerHTML = `
        <div class="overflow-hidden">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-44 object-cover">
        </div>
        <div class="p-4">
            <h3 class="text-stone-100 text-base leading-snug">${meal.strMeal}</h3>
            <button onclick="window.location.href='recipe.html?id=${meal.idMeal}'" class="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">View Recipe</button>
            <button class="save-btn shrink-0 text-xs font-medium text-stone-900 bg-white px-3 py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-200" onclick="saveRecipe('${meal.idMeal}')">Save</button>
        </div>
    `;
    card.querySelector(".save-btn").hidden = !auth.currentUser;
    return card;
}