/*
 
 */

var cl_summlen = jumlah_kata_dalam_ringkasan;
var all_entries; var entries; var all_labels = []; var json;

function createEntries(json){
    var entries_obj_list = [];
    var entries = json.feed.entry;
    for(var i=0; i<entries.length; i++){
        var entry           = entries[i];
        var entry_obj       = new Object;
        entry_obj.id        = entry.id.$t;
        entry_obj.title     = entry.title.$t;
        entry_obj.href      = getEntryHref(entry);
        entry_obj.content   = getEntryContent(entry);
        entry_obj.labels    = getEntryLabels(entry);
        entry_obj.published = entry.published.$t.substr(0, 10);
        entries_obj_list.push(entry_obj);
    }
    return entries_obj_list;
}
function getEntryById(id){
    for(var i=0; i<all_entries.length; i++){
        if(all_entries[i].id == id){return all_entries[i];}
    } return null;
}
function getEntryContent(entry){
    return entry.content ? entry.content.$t : entry.summary.$t;
}
function getEntryHref(entry){
    var links = entry.link;
    for(var i=0; i<links.length; i++){
        if(links[i].rel == "alternate"){return links[i].href;}
    }
    return null;
}
function getEntryLabels(entry){
    var labels     = [];
    var categories = entry.category;
    if(!categories){return labels;}
    for(var i=0; i<categories.length; i++){
        var label = categories[i].term;        
        if(!isExists(all_labels, label)){all_labels.push(label);} // while collecting all labels
        labels.push(label);
    }
    return labels;
}
function getSomeEntries(cmp){
    entries = [];
    for(var i=0; i<all_entries.length; i++){
        var entry = all_entries[i];
        if(cmp(entry)){entries.push(entry);}
    }
    return entries;
}
function isExists(array, val){
    for(var i=0; i<array.length; i++){
        if(array[i] == val){return true;}
    } return false;
}
function onLoadFeed(json_arg){
    json = json_arg;
    setTimeout("onLoadFeedTimeout()", 100);
}
function onLoadFeedTimeout(){
    entries = createEntries(json);
    all_entries = entries;
    showHeaderOption();
    showEntries(entries);
}
function showEntries(entries){
    var s = "";
    for(var i=0; i<entries.length; i++){
        var entry = entries[i];
        s += "<p>";
        s += titleCode(entry);
        s += "<span style='font-size:80%'>Label: " + labelsCode(entry);
        s += " pada " + publishedDateCode(entry) + "</span>";
        s += "</p>";
    }
  
    document.getElementById("cl_content_list").innerHTML = s;
}
function showHeaderOption(){
    var s = "";
    s += "<table>";
    s += "<tr>";
    s += "<td style='text-align:right'>Urut berdasar: ";
    s += "<td><select onchange='sortBy(this.value.substr(1), this.value.substr(0,1))'>";
    s += "<option value='0published'/>Tanggal";
    s += "<option value='1title'/>Judul";
    s += "</select>";
    s += "<tr>";
    s += "<td style='text-align:right'>Label: ";
    s += "<td><select onchange='showPostsWLabel(this.value)' id='cl_labels'>";
    s += "<option value='*'/>Semua label";
    for(var i=0; i<all_labels.length; i++){
        var label = all_labels[i];
        s += "<option value='"+label+"'/>" + label;
    }
    s += "</select>";
    s += "<tr>";
    s += "<td><td><a href='javascript:showPostsWLabel(\"*\");'>Lihat semua label</a>";
    s += "</table>";
    document.getElementById("cl_option").innerHTML = s;
}
function shortenContent(entry){
    var content = entry.content;
    content = stripHTML(content);
    if(content.length > cl_summlen){
        content = content.substr(0, cl_summlen);
        if(content.charAt(content.length-1) != " "){content = content.substr(0, content.lastIndexOf(" ")+1);}
        content += "...";
    }
    entry.content = content;
    return content;
}
function showHideSummary(obj){
    var p = obj.nextSibling;
    while(p.className != "cl_content"){p = p.nextSibling;}
    var id = p.id;
    var entry = getEntryById(id);
    var content = shortenContent(entry);
    if(p.innerHTML == ""){
        p.innerHTML = content + "<br/>";
        obj.innerHTML = "▼";
        obj.title = "sembunyikan ringkasan";
    } else {
        p.innerHTML = "";
        obj.innerHTML = "►";
        obj.title = "lihat ringkasan";
    }
}
function sortBy(attribute, asc){
    var cmp = function(entry1, entry2){
        if(entry1[attribute] == entry2[attribute]){return 0;}
        else if(asc=='1'){return entry1[attribute].toLowerCase() > entry2[attribute].toLowerCase();}
        else{return entry1[attribute].toLowerCase() < entry2[attribute].toLowerCase();}
    }
    entries.sort(cmp);
    showEntries(entries);
}
function stripHTML(s) {
    var c;
    var intag = false; var newstr = "";
    for(var i=0; i<s.length; i++){
        c = s.charAt(i);
        if(c=="<"){intag = true;}
        else if(c==">"){intag = false;}
        if(c == ">"){newstr += " ";}
        else if(!intag){newstr += c;}
    }
    return newstr;
}

// --------------------- functions returning HTML code -------------------- \\
function labelsCode(entry){
    var s = "";
    if(entry.labels.length == 0){return " (tidak berlabel) ";}
    for(var j=0; j<entry.labels.length; j++){
        var label = entry.labels[j];
        s += "<a href='javascript:showPostsWLabel(\""+label+"\")' ";
        s += "title='lihat semua post dengan label \""+label+"\"'>" + label + "</a>";
        s += (j != entry.labels.length-1) ? ", " : "";
    }
    return s;
}
function publishedDateCode(entry){
    var y = entry.published.substr(0, 4);
    var m = entry.published.substr(5, 2);
    var d = entry.published.substr(8, 2);
    var s = "<a href='javascript:showPostsInDate(\""+y+"\")' title='Sort article by "+y+"'>" + y + "</a>/";
    s += "<a href='javascript:showPostsInDate(\""+y+"-"+m+"\")' title='Sort article by "+y+"/"+m+"'>" + m + "</a>/";
    s += "<a href='javascript:showPostsInDate(\""+y+"-"+m+"-"+d+"\")'title='Sort article by  "+y+"/"+m+"/"+d+"'>" + d + "</a>";
    return s;
}
function titleCode(entry){
    var s = "<span title='lihat ringkasan' onclick='showHideSummary(this)' style='cursor:pointer'>►</span> ";
    s += "<b><a href='"+entry.href+"'>" + entry.title + "</a></b> <br/>";
    s += "<span class='cl_content' id='"+entry.id+"'></span>";
    return s;
}

// ----------------------- selection functions ------------------------------ \\

function showPostsInDate(date){
    var cmp = function(entry){return entry.published.indexOf(date) == 0;}
    var entries = getSomeEntries(cmp);
    showEntries(entries);
}
function showPostsWLabel(label){
    var cmp = function(entry){
        if(label == "*"){return true;}
        for(var i=0; i<entry.labels.length; i++){
            if(entry.labels[i] == label){return true;}
        }
        return false;
    }
    var entries = getSomeEntries(cmp);
    showEntries(entries);
    document.getElementById("cl_labels").value = label;
}
