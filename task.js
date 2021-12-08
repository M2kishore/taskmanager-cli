let fs = require("fs");
let arguments = process.argv.slice(2);
//constants
const taskFile = "task.txt";
const completedFile = "completed.txt";
//Classes
class Task{
    constructor(priority,description,status = "pending"){
        this.priority = priority;
        this.description = description;
        this.status = status;
    }
    markCompleted(){
        this.status = "completed";
    }
    toString(){
        return (this.description + " ["+this.priority+"]");
    }
}
class TaskList{
    constructor(){
        this.tasks = [];
        this.getContent();
    }
    //adds task to file
    addTask(task){
        let low = 0;
		let high = this.tasks.length;
	    while (low < high) {
		    let mid = low + high >>> 1;
		    if (this.tasks[mid].priority <= task.priority) low = mid + 1;
		    else high = mid;
	    }
        this.tasks.splice(low,0,task);
        this.updateTaskFile();
        console.log("Added task: "+"\""+task.description+"\""+" with priority "+task.priority);
    }
    //delete task from file
    deleteTask(index){
        if(this.tasks.length === 0){
            console.log("no items to remove");
            return;
        }
        if(index > this.tasks.length || index <= 0){
            console.log("Error: task with index #"+index+" does not exist. Nothing deleted.");
            return;
        }
        this.tasks.splice(index-1,1);
        //write to text files
        this.updateTaskFile();
        this.updateCompletedFile();
        console.log("Deleted task #"+index);
    }
    //marks pending task as completed
    markCompleted(index){
        let pendingTasks = this.getPending();
        if(index <= 0 || index > pendingTasks.length){
            console.log("Error: no incomplete item with index #"+index+" exists.");
        }else{
            pendingTasks[--index].markCompleted();   
            //update completed.txt
            this.updateCompletedFile();
            console.log("Marked item as done.");         
        }
    }
    //overwrites task.txt
    updateTaskFile(){
        //write the tasks in the tasks.txt
        let tasks = this.tasks;
        let taskText = "";
        for(let task of tasks){
            taskText += task.priority+" "+task.description + "\n";
        }
        fs.writeFile(taskFile,taskText,(error)=>{
            if(error) console.log(error.message);
        });

    }
    //overites completed.txt
    updateCompletedFile(){
        //write all the completed tasks in the completed.txt
        let completedTasks = this.getCompleted();
        let completedText = "";
        for(let task of completedTasks){
            completedText += task.description + "\n";
        }
        fs.writeFile(completedFile,completedText,(error)=>{
            if(error) console.log(error.message);
        });

    }
    // initializes the TaskList by giving status to the tasks
    getContent(){
        let completedArray = [];
        let task = new Task(-1,"");
        try{
            if(fs.existsSync(completedFile)){ //checks file existence
                const data = fs.readFileSync(completedFile,{encoding: "utf8", flag: "r"});
                if(data !== ""){
                    completedArray = data.split("\n");
                }            
            }else{
                fs.writeFile(completedFile,"",(error)=>{
                    if(error) console.log(error.message);
                });
            }

        }catch(error){
            console.log(error);
        }
        try{
            if(fs.existsSync(taskFile)){
                const data = fs.readFileSync(taskFile,{encoding: "utf8", flag: "r"});
                if(data === ""){
                    console.log("the file is empty");
                    return;
                }
                //processing the data
                let dataArray = data.split("\n");
                dataArray.pop();
                for(let data of dataArray){
                    let taskSplit = data.split(" ");
                    let priority = Number.parseInt(taskSplit.shift());
                    let description = taskSplit.join(" ");
                    //check if completed
                    task = completedArray.includes(description) ? 
                            (new Task(priority,description,"completed")) :
                            (new Task(priority,description));
                    this.tasks.push(task);
                }
            }else{
                fs.writeFile(taskFile,"",(error)=>{
                    if(error) console.log(error.message);
                });
            }
        }catch(error){
            console.log(error)
        }
    }
    //filters completed tasks
    getCompleted(){
        return this.tasks.filter((task)=>{
            return task.status === "completed";
        });
    }
    //filters pending tasks
    getPending(){
        return this.tasks.filter((task)=>{
            return task.status === "pending";
        })
    }
}
// initialize the list form the file
let List = new TaskList();
//processing atguments
let argLength = arguments.length;
if(argLength === 3){
    //add
    let command = arguments[0];
    if(command === "add"){
        //create new task
        let priority = Number.parseInt(arguments[1]);
        let description = arguments[2];
        let newTask = new Task(priority,description);
        //add new task to TaskList
        List.addTask(newTask);
    }
}
else if(argLength === 2){
    let command = arguments[0];
    let index = arguments[1];
    if(command === "del"){
        //delete
        List.deleteTask(index);
    }
    if(command === "done"){
        //mark completed
        List.markCompleted(index);
    }
    else if(command === "add"){
        console.log("Error: Missing tasks string. Nothing added!");
    }
}
else if(argLength === 1){
    let command = arguments[0];
    //help
    if(command === "help"){
        help();
    }
    //report
    else if(command === "report"){
        report();
    }
    //ls
    else if(command === "ls"){
        ls();
    }
    else if(command === "add"){
        console.log("Error: Missing tasks string. Nothing added!");
    }
    else if(command === "del"){
        console.log("Error: Missing NUMBER for deleting tasks.");
    }
    else if(command === "done"){
        console.log("Error: Missing NUMBER for marking tasks as done.");
    }
}else if(argLength === 0){
    help();
}
//Helper Functions
//help
function help(){
    console.log("Usage :-");
    console.log("$ ./task add 2 hello world    # Add a new item with priority 2 and text \"hello world\" to the list");
    console.log("$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order");
    console.log("$ ./task del INDEX            # Delete the incomplete item with the given index");
    console.log("$ ./task done INDEX           # Mark the incomplete item with the given index as complete");
    console.log("$ ./task help                 # Show usage");
    console.log("$ ./task report               # Statistics");
}
//report
function report(){
    let completedList = List.getCompleted();
    let pendingList = List.getPending();
    let completedLength = completedList.length;
    let pendingLength = pendingList.length;
    console.log("Pending : " + pendingLength);
    for(let i=0;i<pendingLength;i++){
        console.log((i+1)+". "+ pendingList[i].description + " ["+pendingList[i].priority+"]");
    }
    console.log("\nCompleted : " + completedLength);
    for(let i=0;i<completedLength;i++){
        console.log((i+1)+". "+ completedList[i].description);
    }
}
//ls
function ls(){
    let pendingList = List.getPending();
    if(pendingList.length === 0){
        console.log("There are no pending tasks!");
        return;
    }
    let pendingLength = pendingList.length;
    for(let i=0;i<pendingLength;i++){
        console.log((i+1)+". "+ pendingList[i].description + " ["+pendingList[i].priority+"]");
    }
}