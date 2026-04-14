const id = new URLSearchParams(window.location.search).get("id");
getRecipe(id);

async function getRecipe(id){
    try{
        const recipeApi = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const recipeData = await recipeApi.json();
        const meal = recipeData.meals[0];
        const rContainer = document.getElementById("recipeContainer");

        const ingredients = [...Array(20)]
            .map((_, i) => {
                const ingredient = meal[`strIngredient${i + 1}`];
                const measure = meal[`strMeasure${i + 1}`];
                if (!ingredient || !ingredient.trim()) return '';
                return `
                    <div style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:#EDE8DF; border-radius:10px;">
                        <span style="width:6px; height:6px; border-radius:50%; background:#BA7517; flex-shrink:0;"></span>
                        <span style="font-size:13px; color:#6B6357;">${measure?.trim()}</span>
                        <span style="font-size:13px; color:#1A1209; font-weight:500;">${ingredient.trim()}</span>
                    </div>`;
            }).join('');

        const steps = meal.strInstructions
            .split(/\r\n|\n/)
            .filter(s => s.trim())
            .map((step, i) => `
                <div style="display:flex; gap:14px; align-items:flex-start;">
                    <span style="min-width:24px; height:24px; border-radius:50%; background:#FAC775; color:#633806; font-size:12px; font-weight:500; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px;">${i + 1}</span>
                    <p style="margin:0; font-size:14px; color:#6B6357; line-height:1.7;">${step.trim()}</p>
                </div>`
            ).join('');

        rContainer.innerHTML = `
            <div style="max-width:680px; margin:0 auto; padding:2rem 1rem;">

                <button onclick="history.back()" style="display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-size:13px; color:#6B6357; margin-bottom:1.5rem; padding:0;">
                    ← Back
                </button>

                <div style="border-radius:20px; overflow:hidden; margin-bottom:1.5rem; position:relative;">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width:100%; height:320px; object-fit:cover; display:block;">
                    <div style="position:absolute; bottom:0; left:0; right:0; padding:2rem 1.5rem 1.5rem; background:linear-gradient(to top, rgba(0,0,0,0.7), transparent);">
                        <h1 style="margin:0; font-size:28px; font-weight:500; color:#fff; line-height:1.3;">${meal.strMeal}</h1>
                    </div>
                </div>

                <span style="display:inline-block; margin-bottom:1.5rem; font-size:13px; color:#6B6357;">${meal.strArea}</span>

                <div style="margin-bottom:2rem;">
                    <p style="font-size:11px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#BA7517; margin:0 0 0.75rem;">Ingredients</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                        ${ingredients}
                    </div>
                </div>

                <div>
                    <p style="font-size:11px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#BA7517; margin:0 0 0.75rem;">Instructions</p>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${steps}
                    </div>
                </div>

            </div>
        `;

    } catch(error){ console.log("ERROR:", error); }
}