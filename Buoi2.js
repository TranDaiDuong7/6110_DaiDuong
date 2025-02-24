// var global;
// LoadSync();
// function Load(){
//     fetch("http://localhost:3000/posts").then(
//         function(data){
//             return data.json();
//         }
//     ).then(
//         function(data){
//             console.log(data);
//         }
//      )
// }



// function checkExist(id){
//     let ids = global.map(e=>e.id);
//     return ids.includes(id+'');
// }

// function Save(){
//     let id = document.getElementById("id").value;
//     let obj = {
//         id: id,
//         title: document.getElementById("title").value,
//         views: document.getElementById("views").value,
//     }
//     if(checkExist(id)){
//         //edit
//         fetch("http://localhost:3000/posts/"+id,{
//             method:'PUT',
//             headers:{
//                 "Content-Type":"application/json"
//             },
//             body:JSON.stringify(obj)
//         }).then(
//             function(data){
//                 LoadSync();
//             }
//         )
//     }else{
//         //create
//         if(id.length==0){
//             obj.id=(getMax()+1);
//         }
//         fetch("http://localhost:3000/posts",{
//             method:'POST',
//             headers:{
//                 "Content-Type":"application/json"
//             },
//             body:JSON.stringify(obj)
//         }).then(
//             function(data){
//                 LoadSync();
//             }
//         )
//     }
    
// }
// async function LoadSync(){
//     let res = await fetch("http://localhost:3000/posts");
//     let posts = await res.json();
//     posts=posts.filter(function(e){
//         return !e.isDeleted
//     })
//     global = posts;
//     let body = document.getElementById("body");
//     body.innerHTML ="";
//     for (const post of posts) {
//         body.innerHTML += ConvertFromObjectToHTML(post);
//     }
// }

// function Delete(id)
// {
//     let post = global.filter(function(p){
//         return p.id==id;
//     })[0];
//     post.isDeleted=true;
//     fetch("http://localhost:3000/posts/"+id,{
//         method:'PUT',
//         headers:{
//             "Content-Type":"application/json"
//         },
//         body:JSON.stringify(post)
//     })
//     .then(
//         function(data){
//             LoadSync();
//         }
//     )
// }

// function getMax(){
//     let ids = global.map(e=>Number.parseInt(e.id));
//    return Math.max(...ids);
// }

// function ConvertFromObjectToHTML(post){
//     let string = '<tr>'
//     string+=`<td>${post.id}</td>`;
//     string+=`<td>${post.title}</td>`
//     string+=`<td>${post.views}</td>`
//     string+=`<td><button onclick="Delete(${post.id});">Delete</button></td>`
//     string+='</tr>'
//     return string;
// }
var globalPosts = [], globalAuthors = [];

async function LoadSync() {
    let resPosts = await fetch("http://localhost:3000/posts");
    let resAuthors = await fetch("http://localhost:3000/authors");
    globalPosts = (await resPosts.json()).filter(p => !p.isDeleted);
    globalAuthors = await resAuthors.json();
    renderPosts();
    renderAuthorsDropdown();
}

function renderPosts() {
    let body = document.getElementById("body");
    body.innerHTML = "";
    globalPosts.forEach(post => {
        body.innerHTML += ConvertFromObjectToHTML(post);
    });
}

function renderAuthorsDropdown() {
    let authorSelect = document.getElementById("author");
    authorSelect.innerHTML = globalAuthors.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
}

function checkExist(id) {
    return globalPosts.some(post => post.id == id);
}

function Save() {
    let id = document.getElementById("id").value;
    let obj = {
        id: id.length ? id : (getMax() + 1),
        title: document.getElementById("title").value,
        views: parseInt(document.getElementById("views").value) || 0,
        author: document.getElementById("author").value,
        isPublished: true,
        isDeleted: false
    };

    if (checkExist(id)) {
        fetch(`http://localhost:3000/posts/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj)
        }).then(() => LoadSync());
    } else {
        fetch("http://localhost:3000/posts", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj)
        }).then(() => {
            increasePostCount(obj.author);
            LoadSync();
        });
    }
}

function Delete(id) {
    let post = globalPosts.find(p => p.id == id);
    if (post) {
        post.isDeleted = true;
        fetch(`http://localhost:3000/posts/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post)
        }).then(() => LoadSync());
    }
}

function getMax() {
    return globalPosts.length ? Math.max(...globalPosts.map(e => Number.parseInt(e.id))) : 0;
}

function ConvertFromObjectToHTML(post) {
    return `<tr>
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.views}</td>
        <td>${post.author}</td>
        <td><button onclick="Delete(${post.id})">Delete</button></td>
    </tr>`;
}

function increasePostCount(authorName) {
    let author = globalAuthors.find(a => a.name === authorName);
    if (author) {
        author.postCount++;
        fetch(`http://localhost:3000/authors/${author.id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(author)
        });
    }
}

document.addEventListener("DOMContentLoaded", LoadSync);

