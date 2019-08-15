import axios from 'axios';
import {key, proxy} from '../config';


export default class Recipe {
    constructor(id){
        this.id = id;
    }
    
    async getRecipe(){
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log(res);
        } catch (error) {
            console.log(error);
            alert('Something went wrong x_x');
        }
    }

    calcTime(){
        // assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const unit = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            // 1. Uniform units
            let ingredient = el;
            unitsLong.forEach((unit, i) => { 
                ingredient.replace(unit, unitsLong[i]);
            });

            // 2. Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3. Parse ingredients into count, unit and ingredients
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => unit.includes(el2));

            let objIng;

            if(unitIndex > -1){
                // if there is unit
                let count;
                const arrCount = arrIng.slice(0, unitIndex);

                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            }else if(parseInt(arrIng[0], 10)){
                // there isnt unit but the first element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            }else if(unitIndex === -1){
                // there is no unit and number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });

        this.ingredients = newIngredients;
    }

    updateServings(type){
        // servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // ingredients
        this.ingredients.forEach(el => {
            el.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}