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

auth.onAuthStateChanged(user => {

    if(user){
        whenSignedIn.classList.remove("hidden");
        signInBtn.classList.add("hidden");
        document.getElementById("userPhoto").src = user.photoURL;
    }

    else{
        whenSignedIn.classList.add("hidden");
        signInBtn.classList.remove("hidden");

        if (unsubscribe) unsubscribe();
    }
});

auth.onAuthStateChanged(user => {
    if(user){
        getSavedRecipes();
    }
});

function getSavedRecipes(){
    const savedContainer = document.getElementById("savedContainer");
    const user = auth.currentUser;
    db.collection("meals").where("uid", "==", user.uid).get().then(snapshot => {
        snapshot.forEach(async doc =>{
            const savedMealID = doc.data().mealID; 
            const savedApi = await fetch (`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${savedMealID}`);
            const savedData = await savedApi.json();
            console.log(savedData);
            const savedMeal = savedData.meals[0];

            const mealDiv = document.createElement("div");
            mealDiv.className = "card bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 cursor-pointer";
            mealDiv.innerHTML = `
                    <div class="overflow-hidden">
                        <img src="${savedMeal.strMealThumb}" alt="${savedMeal.strMeal}" class="w-full h-44 object-cover">
                    </div>
                    <div class="p-4">
                        <h3 class="text-stone-100 text-base leading-snug">${savedMeal.strMeal}</h3>
                        <button onclick="window.location.href='recipe.html?id=${savedMeal.idMeal}'" class="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">View Recipe</button>
                        <button onclick="deleteRecipe('${doc.id}')" class="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">Delete</button>
                    </div>
            `;
            savedContainer.appendChild(mealDiv);

        });
    }).catch(error => console.log(error));  
}

function deleteRecipe(docId){
    db.collection("meals").doc(docId).delete();
    const savedContainer = document.getElementById("savedContainer");
    savedContainer.innerHTML = "";
    getSavedRecipes();
}