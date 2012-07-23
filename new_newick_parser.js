// PARSENEWICKSTRING
// Actually a wrapper for the true parser, to set up the environment and clear up afterwards

function Node(){
}

Node.prototype.isRoot=function(){
        return ((typeof this.parent) === 'undefined');
}
Node.prototype.isLeaf=function(){
        return ((typeof this.children) === 'undefined' || this.children.length==0);
}
//convert to newick string
Node.prototype.toString=function(){
        print(this.name);
        if (this.children){
                childstr=("(" + this.children.map(function(s){return s.toString()}).join() + ")");
                if (this.isRoot()){
                        return childstr + ";";
                }else {
                        return childstr;
                }
        }else {
                return this.name;
        }
}

function parseNewickString(newick_string){
	
	//the 'temp' object holds the parser's working memory so we don't have to pass it around while doing recursion and calling other functions
	temp = new Object();		
	temp.index = 0;			//the index of each node
	temp.cursor = 0;			//the position of the cursor
	temp.parents = new Array();	//a FILO stack to remeber the parent nodes
	
	//calling the function that decides what to do for each character.
	var nodesArray = theDecider(null,newick_string);
	delete temp;
	return nodesArray;
}
		
// THEDECIDER
// The true parser. It's called recursively and takes the array of nodes (except the first time it's called) and the string to parse.

function theDecider(nodes,newick_string){
	//check if this is the first call, if so declare 'nodes'
	if(nodes == null) {
		var nodes = new Array();	
	}
	
	//look at the current character, decide what to do
	switch(newick_string[temp.cursor])
	{
		
		case "(":
			temp.cursor++;
			newNode(null,nodes,newick_string); //create a new internal node (null name)
			break;		
		case ",":
			temp.cursor++; 
			theDecider(nodes,newick_string); //recursion	
			break;		
		case ")":
			temp.parents.pop(); //forget latest parent
			
			temp.cursor++;
			theDecider(nodes,newick_string); //recursion	
			break;
		case ";":
			//we're done here
			break;
		
		default:
			//get the name.
			var name = newick_string.substring(temp.cursor).match("^[0-9A-Za-z_|]+");
			// some browsers return an array of 1 string instead of a string; this line fixes it.
			name = name instanceof Array ? name[0] : name;
			
			temp.cursor += name.length; 
			newNode(name,nodes,newick_string); //create a new leaf node
			break;
	}
	return nodes;
}

// NEWNODE
// Creates a new node, which will be a leaf node if we pass a name or an internal node if name is null.
function newNode(name,nodes,newick_string){
	
	nodes[temp.index] = new Node(); //create a new node
	
	//we do things differently if this is a leaf (i.e. named) node or a parent node.
	if(name == null) {
		nodes[temp.index].children = new Array(); //this node will have children
		nodeLinker(nodes,newick_string); //link this node to its parent
		temp.parents.push(temp.index); //add this node to the parent stack
		
	}else{
		nodes[temp.index].name = name;
		nodeLinker(nodes,newick_string); //link
	}

	temp.index++;
	theDecider(nodes,newick_string); //recursion
	
}

// NODELINKER
// Links the current node (temp.index) to its parent.
function nodeLinker(nodes,newick_string){
	if(temp.parents.length){
		nodes[temp.index].parent = temp.parents[temp.parents.length-1]; //tell this node about its parents
		nodes[nodes[temp.index].parent].children.push(temp.index); //tell its parent about its new child.
	}
}


//MYSTUFF

function gettext(url) {
    if (typeof readFile == "function") return readFile(url);  // Rhino
    else if (typeof snarf == "function") return snarf(url); // Spidermonkey
    else if (typeof read == "function") return read(url);   // V8
    else throw new Error("No mechanism to load module text");
}

//ADDITIONS

//Link up a tree's parent and children to actual nodes rather than numeric refs
function fixNode(nodes,n){
        if (n.children){
                print(n.children);
                print(n.children.map(function(x){return nodes[x].name}));
                n.children=n.children.map(function(x){return nodes[x]});
        }
        if(n.parent){
                n.parent=nodes[n.parent];
        }
        return n;
}

//return the first node in an array that matches isRoot()
function getRoot(nodes){
        for (i=0; i < nodes.length; i++){
                node=nodes[i];
                if(node.isRoot()){
                        return node;
                }
        }
}

//enforce a bifurcating tree
function enforceBi(node){
        if (node.children){
                node.children.map(enforceBi);
        }
        if (node.children){
                if (node.children.length==2){
                        return;
                }else if (node.children.length==1){
                        //remove ourself
                        par = node.parent
                        node.children[0].parent=par;
                        for (i=0; i < par.children.length; i++){
                                if (par.children[i]==this){
                                        par.children[i]=node.children[0];
                                }
                        }
                        return;
                }else {
                        while(node.children.length>2){
                                newnode=new Node();
                                newnode.children=node.children.slice(0,2);
                                newnode.parent = node;
                                node.children[1]=newnode; //overwrite child 1 and...
                                node.children.shift(); // drop child 0
                        }
                        return;
                }
        }
}

//unroot a bifurcating tree 
function unroot(root){
        if (node.children[0].isLeaf){
                newroot = node.children[1];
                newchild = node.children[0];
        }else {
                newroot = node.children[0];
                newchild = node.children[1];
        }
        newroot.children.push(newchild);
        newchild.parent=newroot;
        newroot.parent=undefined;
        return newroot;
}

//convert array of nodes into tree structure
function makeTree(nodes){
        n = getRoot(nodes.map(function(x){return fixNode(nodes,x)}));
        enforceBi(n);
        return unroot(n);
}

newick_string="((A,B),(C,D),(E,F,G));"
root=makeTree(parseNewickString(newick_string));

print(root);
