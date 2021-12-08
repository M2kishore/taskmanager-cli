let fs = require("fs");
let arguments = process.argv.slice(2);
const taskFile = "task.txt";
const completedFile = "completed.txt";
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
        console.log("Added task: "+task.description+" with priority "+task.priority);
    }
    deleteTask(index){
        if(this.tasks.length === 0){
            console.log("no items to remove");
            return;
        }
        if(index > this.tasks.length || index <= 0){
            console.log("invalid id");
            return;
        }
        this.tasks.splice(index-1,1);
        //write to text file
        this.updateTaskFile();
        console.log("Deleted item with index "+id);
    }
    markCompleted(index){
        if(index > this.tasks.length || index <= 0){
            console.log("invalid index");
            return;
        }
        this.tasks[index].markCompleted();
        //update completed.txt
        console.log("Marked item as done");
    }
    updateTaskFile(){
        //write the tasks in the tasks.txt
    }
    updateCompletedFile(){
        //write all the completed tasks in the completed.txt
    }
    getContent(){
        fs.readFile(taskFile,"utf-8",(err,data)=>{
            let dataArray = data.split("\n");
            for(let task of dataArray){
                console.log(task.split(" "));
            }
        })
    }
    getCompleted(){
        return this.tasks.filter((task)=>{
            return task.status === "completed";
        });
    }
    getPending(){
        return this.tasks.filter((task)=>{
            return task.status === "pending";
        })
    }
    printList(){
        console.log(this.tasks);
    }
}
// initialize the list form the file
let List = new TaskList();
//test area
let mytask = new Task(0,"This is the task");
let mytask1 = new Task(2,"This 2 task");
let mytask2 = new Task(1,"This 3 task");
List.addTask(mytask);
List.addTask(mytask1);
List.addTask(mytask2);
List.markCompleted(1);
//test area
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
}
else if(argLength == 1){
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
}
//Helper Function
//help
function help(){
    console.log("./task add 2 hello world    # Add a new item with priority 2 and text \"hello world\" to the list");
    console.log("./task ls                   # Show incomplete priority list items sorted by priority in ascending order");
    console.log("./task del INDEX            # Delete the incomplete item with the given index");
    console.log("./task done INDEX           # Mark the incomplete item with the given index as complete");
    console.log("./task help                 # Show usage");
    console.log("./task report               # Statistics");
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
    let pendingLength = pendingList.length;
    for(let i=0;i<pendingLength;i++){
        console.log((i+1)+". "+ pendingList[i].description + " ["+pendingList[i].priority+"]");
    }
}
