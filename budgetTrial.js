 //BUDGET  CONTROLLER
var budgetController = (function (){

    var Expense= function(id,description, value){
      this.id= id;
       this.description=description;
       this.value=value;
       this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){

        if(totalIncome>0){
        this.percentage = Math.round((this.value/ totalIncome)*100);
             } else{
                 this.percentage = -1;
             }
     };

     Expense.prototype.getPercentage = function(){
         return this.percentage;
     };

    var Income= function(id,description, value){
        this.id= id;
         this.description=description;
         this.value=value;
      };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
        

    };
      
      var data={
          allItems:{
              exp:[],
              inc:[]
          },
          totals:{
              exp:0,
              inc:0
          },
          budget:0,
          percentage:-1
      };

      return {
          addItem: function(type,des,value){
            var newItem, ID;

            //Create new ID
            if(data.allItems[type].length>0){
            ID= data.allItems[type][data.allItems[type].length-1].id +1  ;
            }
            else{
                ID =0;
            }
            // Create new Item based on 'inc' or 'exp' type 
            if(type === 'exp'){
                newItem = new Expense(ID ,des, value);
            }
            else if(type === 'inc'){
                newItem = new Income (ID, des, value);
            }

            //push it into data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
          },

          //// delete item from data structure

deleteItem: function(type, id){ 
    var ids, index;
    // id = 6
    // data.allItem[type][id];
    //ids =[1 2 4 6 8]
    // index = 3


    ids = data.allItems[type].map(function(current){
        return current.id;
    });
    index = ids.indexOf(id);

    if(index !== -1){
        data.allItems[type].splice(index,1);
    }

},

          calculateBudget: function(){
              // calculate total income and expenses
              calculateTotal('inc');
              calculateTotal('exp');

        // calculate budget : income - expenses
        
        data.budget = data.totals.inc - data.totals.exp;

        // calculate percentage of income
            if(data.totals.inc>0){
            data.percentage = Math.round(data.totals.exp/data.totals.inc * 100);
            }else{
                data.percentage = -1;
            }
          },

          calculatePercentages : function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            }); 


          },

          getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
          },

          getBudget:function(){
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage 
                }

          },

          testing: function(){
              console.log(data);
          }
      }


})();



//UI CONTROLLER

var UIController =  (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue:'.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',                        //this one
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',   
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'

    };

   var formatNumber= function(num, type){
        var numSplit, int, dec;
         /* Rules for number
 
         + or - before the number
         exactly 2 decimal points 
         comma seperating the thousands
 
         2310.4567 -> 2,310.46
         2000 -> 2,000.00
 
         */
 
         num = Math.abs(num);
         num = num.toFixed(2);
 
         numSplit = num.split('.');
 
         int = numSplit[0];
 
         if(int.length>3)
         {
             int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3 , 3);
             // input 23510  --> output 23,510
         }
         
      dec = numSplit[1];
      return (type==='exp'?'-':'+') + ''+ int +'.'+ dec;  
     };
 
     var nodeListForEach = function(list, callback){
        for (var i=0 ; i< list.length; i++){
            callback(list[i],i);
        }
    };

    return{
        getInput: function(){
            return{
            type: document.querySelector(DOMstrings.inputType).value,   //inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)         
        };
    },
     addListItem: function(obj, type){                          //this entire block
       
        var html, newHtml, element;
        // Html string with some placeholder text
        if(type === 'inc')
        {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }else if(type === 'exp'){
            
     element = DOMstrings.expensesContainer;
      html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>      <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>                   </div></div></div>';
        }

        // Replace place holder text
        
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


        // Insert the HTML into the DOM

        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       },

       deleteListItem: function(selectorID){
         
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);


       },


       clearFields:function(){
           var fields, fieldsArr;

           fields = document.querySelectorAll(DOMstrings.inputDescription + ','+ DOMstrings.inputValue);

           fieldsArr = Array.prototype.slice.call(fields);

           fieldsArr.forEach(function(current, index, array ){
               current.value="";
           });
           
           fieldsArr[0].focus();
       },

       displayBudget: function(obj){
           var type;
           obj.budget>0? type='inc': type='exp';
           document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
           document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
           document.querySelector(DOMstrings.expensesLabel).textContent =formatNumber(obj.totalExp,'exp');
           if(obj.percentage > 0){
           document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
           }else{
            document.querySelector(DOMstrings.percentageLabel).textContent='---';
           }
        },
    
    displayPecentages: function(percentages){

        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

        // above field returns a list actuallu a null list

        // here we create foreach function for nodeList instead of array

        
        NodeListForEach(fields, function(current, index){
            // do stuff
            if(percentages[index] > 0)
            {
            current.textContent = percentages[index] + '%';
          } 
          else{
                current.textContent='---';
            }

        });

    },

    displayDate: function(){
        var now, year,month;
        now =  new Date();
        
        year = now.getFullYear();
        
        months =['January', 'February','March','April','May','June', 'July', 'August',
                'September','October','November','December'];
        month = now.getMonth();

        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
    },

    changedType: function(){
        var fields = document.querySelectorAll(
            DOMstrings.inputType + ','+
            DOMstrings.inputDescription+ ','+
            DOMstrings.inputValue); 

        nodeListForEach(fields, function(cur){
            cur.classList.toggle('red-focus');
        });
         document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    getDOMstrings: function(){
        return DOMstrings;
    }
    }

})();


// GLOBAL APP CONTROLLER


var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListners = function(){
    var DOM = UIController.getDOMstrings();
     
   
        document.querySelector(DOM.inputBtn).addEventListener('click',cntrlItem);
        document.addEventListener('keypress', function(event){
         if(event.keyCode===13){
            cntrlItem();
        }
      });
      document.querySelector(DOM.container).addEventListener('click',cntrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var updateBudget= function(){
    //Calculate the budget
    budgetCtrl.calculateBudget();

    // Return the budget
    var budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
    //Display the budge on UI
    //console.log(budget);
       
};
    
var updatePercentages = function(){
    //1 . Calculate  percentages
        budgetCtrl.calculatePercentages();

    //2. Read percentages from budget controller
       var percentages = budgetCtrl.getPercentages();
    
    console.log(percentages);
    //3. //3 . update the user interface with new percentages

    UICtrl.displayPecentages(percentages); 

}



var cntrlItem = function(){
    var input, newItem;

    // 1. Get the field input data
     input = UICtrl.getInput();
   // console.log(input);

   if(input.description!=="" && !isNaN(input.value) && input.value>0){

// 2.Add item to budget controller

 newItem = budgetCtrl.addItem(input.type, input.description, input.value);

//3. Add the item to UI                                         this one
    UICtrl.addListItem(newItem, input.type);

 // 4 Clear the fields
UICtrl.clearFields();

// 5. Calculate and update the budget

updateBudget();
//6. calculate and upadate percentages

updatePercentages();


   }
};

var cntrlDeleteItem = function(event){
var itemID, splitID,type, ID;

itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

if(itemID){

    //inc -1

    splitID = itemID.split('-');
    type = splitID[0];
    ID = parseInt(splitID[1]);

    // 1 . delete the item from data structure
        budgetCtrl.deleteItem(type,ID);

    //2 . delete the item from user interface
    UICtrl.deleteListItem(itemID);

    //3 update and show the new budget
       updateBudget();
     
       // update percentages.

      updatePercentages();

    }

};

return {
    init: function(){
        console.log('Application has started.');
        UICtrl.displayDate();
        UICtrl.displayBudget({
            budget:0,
            totalInc:0,
            totalExp:0,
            percentage:-1
        });
        setupEventListners();
    }
};

  
})(budgetController,UIController);

controller.init();