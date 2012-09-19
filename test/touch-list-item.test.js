"use strict";

describe("touch-list-item", function(){
    it("should have at least one test", function(){
        var d = document.createElement('div');
        document.body.appendChild(d);
        var touchListItem = new TouchListItem(d);
    });
});