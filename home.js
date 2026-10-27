// Elementos principais da página inicial
const feed = document.querySelector("#feed");
const createDialog = document.querySelector("#criar-dialog");
const createForm = document.querySelector("#form-criar-post");
const titleInput = document.querySelector("#titulo-post");
const contentInput = document.querySelector("#conteudo-post");
const categoryInput = document.querySelector("#categoria-post");
const imageInput = document.querySelector("#imagem-post");
const searchForm = document.querySelector("#form-pesquisa");
const searchInput = document.querySelector("#barra-pesquisa");
const categoryButtons = document.querySelectorAll(".category-filter");
const emptyMessage = document.querySelector("#mensagem-vazia");
const sortSelect = document.querySelector("#ordenacao");

let nextPostId = 4;
let activeCategory = "Todas";
const postStates = new Map();

document.querySelectorAll(".post").forEach((post) => {
    postStates.set(post.dataset.postId, {
        likes: Number(post.dataset.likes || 0),
        liked: false,
        comments: []
    });
});

function openCreateDialog() {
    createForm.reset();
    createDialog.showModal();
}

document.querySelector("#btn-criar").addEventListener("click", openCreateDialog);
document.querySelector("#btn-criar-banner").addEventListener("click", openCreateDialog);
document.querySelector("#btn-fechar-criacao").addEventListener("click", () => createDialog.close());
document.querySelector("#btn-cancelar-criacao").addEventListener("click", () => createDialog.close());

// Publicação rápida: abre o formulário completo com o texto já digitado.
document.querySelector("#form-post-rapido").addEventListener("submit", (event) => {
    event.preventDefault();
    const quickText = document.querySelector("#texto-rapido");
    openCreateDialog();
    contentInput.value = quickText.value.trim();
    titleInput.value = "Uma nova ideia";
    quickText.value = "";
});

createForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = categoryInput.value;
    const file = imageInput.files[0];

    if (!title || !content) return;
    if (file && !file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");
        return;
    }

    const id = String(nextPostId++);
    const post = document.createElement("article");
    post.className = "post";
    post.dataset.postId = id;
    post.dataset.category = category;
    post.dataset.likes = "0";

    const author = document.createElement("div");
    author.className = "post-author";
    const avatar = document.createElement("div");
    avatar.className = "mini-avatar";
    avatar.textContent = "V";
    const authorInfo = document.createElement("div");
    const authorName = document.createElement("strong");
    authorName.textContent = "Você";
    const meta = document.createElement("span");
    meta.textContent = "Agora · " + category;
    authorInfo.append(authorName, meta);
    author.append(avatar, authorInfo);

    const heading = document.createElement("h2");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.className = "btn-like";
    likeButton.setAttribute("aria-pressed", "false");
    likeButton.append(document.createTextNode("♡ Curtir "));
    const count = document.createElement("span");
    count.className = "like-count";
    count.textContent = "0";
    likeButton.append(count);

    const commentButton = document.createElement("button");
    commentButton.type = "button";
    commentButton.className = "btn-comment";
    commentButton.textContent = "Comentar";

    const categoryTag = document.createElement("span");
    categoryTag.className = "post-category";
    categoryTag.textContent = category;
    actions.append(likeButton, commentButton, categoryTag);

    post.append(author, heading, paragraph);
    if (file) {
        const image = document.createElement("img");
        image.className = "post-image";
        image.alt = title;
        image.src = URL.createObjectURL(file);
        post.append(image);
    }
    const comments = document.createElement("div");
    comments.className = "inline-comments";
    comments.hidden = true;
    post.append(actions, comments);

    postStates.set(id, { likes: 0, liked: false, comments: [] });
    feed.prepend(post);
    createDialog.close();
    applyFilters();
});

feed.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    const post = event.target.closest(".post");
    if (!post || !button) return;
    const state = postStates.get(post.dataset.postId);
    if (!state) return;

    if (button.classList.contains("btn-like")) {
        state.liked = !state.liked;
        state.likes += state.liked ? 1 : -1;
        button.querySelector(".like-count").textContent = state.likes;
        button.firstChild.textContent = state.liked ? "♥ Curtido " : "♡ Curtir ";
        button.setAttribute("aria-pressed", String(state.liked));
        post.dataset.likes = String(state.likes);
    }

    if (button.classList.contains("btn-comment")) {
        const area = post.querySelector(".inline-comments");
        area.hidden = !area.hidden;
        if (!area.hidden) {
            area.replaceChildren();
            state.comments.forEach((comment) => {
                const line = document.createElement("p");
                line.textContent = "Você: " + comment;
                area.append(line);
            });
            const form = document.createElement("form");
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Escreva um comentário...";
            input.maxLength = 500;
            input.required = true;
            input.setAttribute("aria-label", "Escreva um comentário");
            const send = document.createElement("button");
            send.type = "submit";
            send.textContent = "Enviar";
            form.append(input, send);
            form.addEventListener("submit", (submitEvent) => {
                submitEvent.preventDefault();
                const value = input.value.trim();
                if (!value) return;
                state.comments.push(value);
                const line = document.createElement("p");
                line.textContent = "Você: " + value;
                form.before(line);
                input.value = "";
            });
            area.append(form);
            input.focus();
        }
    }
});

categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        categoryButtons.forEach((item) => item.classList.toggle("active", item === button));
        applyFilters();
    });
});

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
});

searchInput.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);

function applyFilters() {
    const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const posts = Array.from(feed.querySelectorAll(".post"));

    posts.forEach((post) => {
        const categoryMatches = activeCategory === "Todas" || post.dataset.category === activeCategory;
        const text = (post.querySelector("h2").textContent + " " + post.querySelector("p").textContent).toLocaleLowerCase("pt-BR");
        const searchMatches = !term || text.includes(term);
        post.hidden = !(categoryMatches && searchMatches);
    });

    if (sortSelect.value === "populares") {
        posts.sort((a, b) => Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0));
        posts.forEach((post) => feed.append(post));
    } else {
        posts.sort((a, b) => Number(b.dataset.postId) - Number(a.dataset.postId));
        posts.forEach((post) => feed.append(post));
    }

    emptyMessage.hidden = posts.some((post) => !post.hidden);
}
