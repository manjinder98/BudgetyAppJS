
// BUDGET CONTROLLER MODULE
var budgetController = (function(){ // Indipendent Module creation used to keep the function private
    
    var Expense = function(id, description, value){ // Function constructor for Expenses 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){ // Function constructor for Incomes
        this.id = id;
        this.description = description;
        this.value = value;
    }; 

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current, index, array){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = { // data structure to store all the variables
        allItems: {
            exp: [],
            inc: []
        },
        totals: { // Totals of the arrays above
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // -1 meaning no existent
    };

    
    
    return {
        addItem: function(type, des, value){ // Function for adding a new Income or Expense into the data structure above
            var newItem, ID;
            
            // Create a new ID
            if (data.allItems[type].length > 0){ // If the length of the array is more than 0 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // the ID can be the position of the last element + 1
            }
            else{
                ID = 0; // Or it starts with 0
            }

            // Create a new Item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, value);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, value);
            }

            // Push it into data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, ID){
            var ids, index;

            ids = data.allItems[type].map(function(current, index, array){ // difference between map and foreach is that map returns a new array
                return current.id;
            });

            index = ids.indexOf(ID); // Retrieve the index of the ID inside of the array

            if(index !== -1){
                data.allItems[type].splice(index, 1); // The function splice delete elements from array by inserting the position of element and the number of the elements
            }
        },

        calculateBudget: function(){
            // Calculate the total Income and Expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // Calculate the budget remaining
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate the percentage of income that have been spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current, index, array){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPercentages;
            allPercentages = data.allItems.exp.map(function(current, index, array){
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    };

})();

// UI CONTROLLER MODULE
var UIController = (function(){ // Independent Module
    
    var DOMstrings = { // Object for storing the DOM strings to retrieve from the HTML code
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num); // absolute value of number
        num = num.toFixed(2); // method for adding two decimal places but return string
        
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // Input: 2310 --> Output: 2,310
        }
        
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){ // function for looping inside of a list
        for (var i=0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){ // Public function used in order to get the HTML elements from the HTML code
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // Converts from String to Number
            };
        },

        addListItem: function(obj, type){ // Adding the new items by type (income or expense) inside of the HTML code
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description); // We use newHtml because then it wouldn't reconsigne or accept the ID
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID){
            var element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function(){ // function for clearing the description and value fields
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); // this method does return a list, not an array, by negating us to use array methods

            fieldsArr = Array.prototype.slice.call(fields); // this trick the slice method by thinking that we are giving an array -- Remember the slice method just copy an Array
        
            fieldsArr.forEach(function(current, index, array){ // for each loop used for looping in the array and emptying the variables inside
                current.value = "";
            });

            fieldsArr[0].focus(); // put the focus back on description field
        },

        displayBudget: function(obj){
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';            }
        },

        displayPercentages: function(percentages){
            var fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); // This is a List!
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }
            });
            
        },

        displayMonth: function(){
            var now, year, month, months;

            now = new Date(); // Get today's date

            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER MODULE
var appController = (function(budgetCtrl, UICtrl){

    var setUpEventListener = function(){ // Used for 'init' function
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem); // Event listener for the button for calling the the method ctrlAddItem
        
        document.addEventListener('keypress', function(event){ // Event listener for the enter key (return)

            if (event.keyCode === 13 || event.which === 13){ // We use keyCode property. We use which because some old browsers do support only which
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType); // Change event for colors
    };

    var updateBudget = function(){
        /* 1. Calculate the budget */
        budgetCtrl.calculateBudget();
        /* 2. Return the budget */
        var budget = budgetCtrl.getBudget();
        /* 3. Display the budget on the UI */
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentage
        var percentages = budgetCtrl.getPercentages();
        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){ // Function that manages all the functions of the web application
        var input, newItem;

        // To-Do List
        /* 1. Get the field from the input data */
        input = UICtrl.getInput();

        if( input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            /* 2. Add the item to the budget controller */
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            /* 3. Add the item to the UI */
            UICtrl.addListItem(newItem, input.type);
            
            /* 3.1  Clear the fields */
            UICtrl.clearFields();
            
            /* 4 Budget Controller */
            updateBudget();

            /* 5 Update Percentages*/
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // Retrieve parent Node (x4) of delete button

        if(itemID){
            splitID = itemID.split('-'); // Splits the string into 2 arrays
            type = splitID[0];
            ID = parseInt(splitID[1]); // parseInt because it is returned as a string

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update the new budget
            updateBudget();

            // 4. Update Percentages
            updatePercentages();
        }
    };

    return { // 'init' has to be public
        init: function(){ // init function
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({ // Set Labels to 0
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListener();
        }
    };

})(budgetController, UIController);

appController.init();