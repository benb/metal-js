test("parse tree",function(){
        newick = "((((((((((E_Euggra,E_Trybru),E_Stylem),E_Acrros),((E_Nictab,E_Aratha),E_Phycap)),(E_Dicdis,(E_Porpur,E_Masbal))),(((E_Schpom,E_Podans),(E_Homsap,E_Caeele)),E_Cyapar)),(E_Plakno,E_Crypar)),E_Blahom),E_Enthis),A_Aerper,A_Metbar);"
        leaves =  "E_Euggra,E_Trybru,E_Stylem,E_Acrros,E_Nictab,E_Aratha,E_Phycap,E_Dicdis,E_Porpur,E_Masbal,E_Schpom,E_Podans,E_Homsap,E_Caeele,E_Cyapar,E_Plakno,E_Crypar,E_Blahom,E_Enthis,A_Aerper,A_Metbar".split(",").sort();
        root=makeTree(parseNewickString(newick));
        deepEqual(root.descendents().sort(),leaves,"has correct descendents");
});


test("dollop",function(){
        newick = "((((((((((E_Euggra,E_Trybru),E_Stylem),E_Acrros),((E_Nictab,E_Aratha),E_Phycap)),(E_Dicdis,(E_Porpur,E_Masbal))),(((E_Schpom,E_Podans),(E_Homsap,E_Caeele)),E_Cyapar)),(E_Plakno,E_Crypar)),E_Blahom),E_Enthis),A_Aerper,A_Metbar);"
        root=makeTree(parseNewickString(newick));
        gap_leaves=["E_Cyapar","E_Caeele","E_Homsap","E_Podans","E_Schpom","E_Phycap","E_Euggra","E_Trybru"];
        ans = root.splitsFor(gap_leaves);

        //Split of "E_Cyapar" should be equal to list
        deepEqual(ans["E_Cyapar"].sort(),["E_Cyapar","E_Caeele","E_Homsap","E_Podans","E_Schpom"].sort());
        //and equal to the split of each of the others in the list
        _.each(["E_Caeele","E_Homsap","E_Podans","E_Schpom"],function(x){
                deepEqual(ans[x],ans["E_Cyapar"]);
        });

        //these two should be the same split
        deepEqual(ans["E_Euggra"],ans["E_Trybru"]);

        //but Schpom should be its own split
        ok(!_.isEqual(ans["E_Euggra"],ans["E_Schpom"]));
        ok(!_.isEqual(ans["E_Phycap"],ans["E_Schpom"]));
        ok(!_.isEqual(ans["E_Phycap"],ans["E_Euggra"]));

        //check the remaining leaves (not in gap_leaves) are undefined
        _.chain(root.descendents()).difference(gap_leaves).each(function(leaf){
                ok(_.isUndefined(ans["leaf"]));
        });
});
