// Primeiro, se define as variáveis para cada paret do Html.
const feed = document.querySelector("#feed");

const postDialog = document.querySelector("#post-dialog");
const createDialog = document.querySelector("#criar-dialog");

const expandedTitle = document.querySelector("#titulo-expandido");
const expandedContent = document.querySelector("#conteudo-expandido");

const commentsList = document.querySelector("#lista-comentarios");
const commentForm = document.querySelector("#form-comentario");
const commentInput = document.querySelector("#texto-comentario");

const createForm = document.querySelector("#form-criar-post");
const titleInput = document.querySelector("#titulo-post");
const contentInput = document.querySelector("#conteudo-post");
const imageInput = document.querySelector("#imagem-post");
const expandedImage = document.querySelector("#imagem-expandida");

// Aqui tem algumas variáveis para a criação de posts.
let nextPostId = 7;
let activePostId = null;

const postData = new Map();

// Registra os posts que já existem no HTML.
document.querySelectorAll(".post").forEach((post) => {
    const id = post.dataset.postId;

    postData.set(id, {
        likes: 0,
        liked: false,
        comments: []
    });
});

// Abre o formulário de criação.
document.querySelector("#btn-criar").addEventListener("click", () => {
    createForm.reset();
    createDialog.showModal();
});

// Fecha o formulário de criação.
document.querySelector("#btn-cancelar-criacao").addEventListener("click", () => {
    createDialog.close();
});

// Cria um novo post.
createForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value;

    const imageFile = imageInput.files[0];
    let imageUrl = null;

    if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem válido.");
            return;
        }

        imageUrl = URL.createObjectURL(imageFile);
    }

    if (!title || !content.trim()) {
        return;
    }

    const id = String(nextPostId++);

    const post = document.createElement("article");
    post.classList.add("post");
    post.dataset.postId = id;

    const heading = document.createElement("h1");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = content;

    const actions = document.createElement("div");
    actions.classList.add("post-actions");

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.classList.add("btn-like");
    likeButton.textContent = "Curtir ";

    const likeCount = document.createElement("span");
    likeCount.classList.add("like-count");
    likeCount.textContent = "0";

    likeButton.append(likeCount);

    const commentButton = document.createElement("button");
    commentButton.type = "button";
    commentButton.classList.add("btn-comment");
    commentButton.textContent = "Comentar";

    actions.append(likeButton, commentButton);

    postData.set(id, {
        likes: 0,
        liked: false,
        comments: []
    });

    if (imageUrl) {
        const image = document.createElement("img");

        image.src = imageUrl;
        image.alt = title;
        image.classList.add("post-image");

        post.append(heading, paragraph, image, actions);
    } else {
        post.append(heading, paragraph, actions);
    }

    feed.prepend(post);
    createDialog.close();
});

// Escuta os cliques nos posts.
feed.addEventListener("click", (event) => {
    const post = event.target.closest(".post");

    if (!post) {
        return;
    }

    const id = post.dataset.postId;
    const data = postData.get(id);

    if (!data) {
        return;
    }

    const likeButton = event.target.closest(".btn-like");
    const commentButton = event.target.closest(".btn-comment");
    const expandButton = event.target.closest(".btn-expand");

    // Curtir ou remover a curtida.
    if (likeButton) {
        data.liked = !data.liked;
        data.likes += data.liked ? 1 : -1;

        const count = likeButton.querySelector(".like-count");
        count.textContent = data.likes;

        likeButton.firstChild.textContent =
            data.liked ? "Curtido " : "Curtir ";

        likeButton.setAttribute(
            "aria-pressed",
            String(data.liked)
        );

        return;
    }

    // Abre o post e direciona o usuário aos comentários.
    if (commentButton) {
        openPost(post);
        commentInput.focus();
        return;
    }

    // Abre o post completo.
    if (expandButton) {
        openPost(post);
        return;
    }

    // Também permite clicar no conteúdo do post.
    if (!event.target.closest("button")) {
        openPost(post);
    }
});

// Exibe o post selecionado.
function openPost(post) {
    activePostId = post.dataset.postId;

    expandedTitle.textContent =
        post.querySelector("h1").textContent;

    expandedContent.textContent =
        post.querySelector("p").textContent;

    const postImage = post.querySelector(".post-image");

    if (postImage) {
        expandedImage.src = postImage.src;
        expandedImage.alt = postImage.alt;
        expandedImage.hidden = false;
    } else {
        expandedImage.removeAttribute("src");
        expandedImage.alt = "";
        expandedImage.hidden = true;
    }

    renderComments();
    postDialog.showModal();
}

// Fecha a visualização do post.
document.querySelector("#btn-fechar-post").addEventListener("click", () => {
    postDialog.close();
});

// Adiciona um comentário ao post aberto.
commentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = commentInput.value.trim();

    if (!text || activePostId === null) {
        return;
    }

    const data = postData.get(activePostId);

    if (!data) {
        return;
    }

    data.comments.push(text);

    commentInput.value = "";
    renderComments();
});

// Atualiza a lista de comentários.
function renderComments() {
    commentsList.replaceChildren();

    const data = postData.get(activePostId);

    if (!data) {
        return;
    }

    data.comments.forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        commentsList.append(item);
    });
}
