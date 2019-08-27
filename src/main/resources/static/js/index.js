// import { ArticleCardTemplate } from 'ArticleCardTemplate.js';

const INDEX_PAGE = (function () {
    const Api = function () {
        const request = {
            get(path, params) {
                return axios.get(`${path}`, {params: params});
            },
            post(path, data) {
                return axios.post(`${path}`, data);
            },
            put(path, data) {
                return axios.put(`${path}`, data);
            },
            delete(path) {
                return axios.delete(`${path}`);
            }
        };

        return {
            request: request
        };
    };

    const IndexPageController = function () {
        const defaultArticlePaginationSize = 5;

        const searchService = new SearchService();
        const articleService = new ArticleService();
        const commentService = new CommentService();
        const ddabongService = new DdabongService();

        const toggleSearchInput = function () {
            document.querySelector('.search-toggle').addEventListener('click', searchService.toggleSearchInput);
        };

        const showSearchedList = function () {
            document.querySelector(".search-input input").addEventListener('keyup', searchService.showSearchedList);
        };

        const fetchArticles = function () {
            articleService.fetchArticlePages(Number.MAX_SAFE_INTEGER, defaultArticlePaginationSize);
        };

        const addComment = function () {
            document.querySelectorAll('.btn-add-comment')
                .forEach(el => el.addEventListener('click', commentService.addComment));
        };

        const toggleHeart = function () {
            document.querySelectorAll('.fa-heart-o')
                .forEach(el => el.addEventListener('click', ddabongService.toggleHeart));
        };

        const deleteArticle = function () {
            document.querySelectorAll('.deleteArticle')
                .forEach(el => el.addEventListener('click', articleService.deleteArticle));
        };

        const getScrollTop = function () {
            return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        };

        const getDocumentHeight = function () {
            const body = document.body;
            const html = document.documentElement;

            return Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
            );
        };

        const init = function () {
            toggleSearchInput();
            showSearchedList();
            fetchArticles();
            addComment();
            toggleHeart();
            deleteArticle();
        };

        const onscroll = function () {
            if (getScrollTop() === getDocumentHeight() - window.innerHeight) {
                const articleCards = document.querySelectorAll('.article-card');

                const minId = Array.from(articleCards).map(function (card) {
                    return parseInt(card.id, 10);
                }).reduce(function (previous, current) {
                    return previous > current ? current : previous;
                });

                articleService.fetchArticlePages(minId, defaultArticlePaginationSize);
            }
        };

        return {
            init: init,
            onscroll: onscroll,
        };
    };

    const ArticleService = function () {
        const defaultCommentPreviewSize = 2;
        const commentService = new CommentService();
        const request = new Api().request;
        const indexArticles = document.querySelector("#index-articles");
        const articleCardTemplate = new ArticleCardTemplate();

        const fetchArticlePages = function (lastArticleId, size) {
            function createNewNode(innerHTML) {
                const node = document.createElement("span");
                node.innerHTML = innerHTML;
                return node;
            }

            function appendCommentsOnArticleCard(json) {
                const commentResponses = json.commentResponses;
                const commentSize = Object.keys(commentResponses).length;
                const commentList = document.querySelector('#comment-list-' + json.id);

                function appendComments(commentList, size) {
                    for (let i = 0; i < size; i++) {
                        commentList.appendChild(createNewNode(articleCardTemplate.comment(commentResponses[i])))
                    }
                }

                function appendArticleModal() {
                    const indexArticlesModal = document.querySelector('#index-articles-modal');
                    const articleModalNode = createNewNode(articleCardTemplate.articleModal(json));
                    indexArticlesModal.appendChild(articleModalNode);

                    const commentModalList = document.querySelector('#comment-list-modal-' + json.id);
                    appendComments(commentModalList, commentSize);
                }

                if (commentSize > defaultCommentPreviewSize) {
                    const commentPreviewMessage = document.querySelector('#comment-preview-message-' + json.id);
                    const commentPreviewMessageNode = createNewNode(articleCardTemplate.commentPreviewMessage(commentSize, json.id));
                    commentPreviewMessage.appendChild(commentPreviewMessageNode);

                    appendComments(commentList, defaultCommentPreviewSize);

                    appendArticleModal();
                    return;
                }

                appendComments(commentList, commentSize);
            }

            request
                .get('/articles', {
                    lastArticleId: lastArticleId,
                    size: size,
                })
                .then(response => {
                    return response.data;
                })
                .then(data => {
                    data.forEach(function (json) {
                        console.log(json);
                        const articleNode = createNewNode(articleCardTemplate.articleCard(json));
                        indexArticles.appendChild(articleNode);

                        appendCommentsOnArticleCard(json);

                        document.querySelectorAll('.btn-add-comment')
                            .forEach(el => el.addEventListener('click', commentService.addComment));

                        document.querySelectorAll('.btn-modal-add-comment')
                            .forEach(el => el.addEventListener('click', commentService.addComment));
                    });
                })
        };

        const deleteArticle = function (event) {
            event.preventDefault();
            const message = event.target.closest("div");
            const articleId = message.parentElement.id;

            request
                .delete('/articles/' + articleId)
                .then(response => {
                    console.log(response);

                    if (response.data === "SUCCESS") {
                        const childNode = message.parentNode;
                        const parentNode = childNode.parentNode;
                        parentNode.removeChild(childNode);
                    }
                }).catch(response => {
                console.log(response);
                alert("게시글에 대한 권한이 없습니다.");
            });
        };

        return {
            fetchArticlePages: fetchArticlePages,
            deleteArticle: deleteArticle,
        }
    };

    const SearchService = function () {
        const toggleSearchInput = function (event) {
            event.preventDefault();
            document.querySelector('.search-box').classList.toggle('active')
            document.querySelector(".search-input").classList.toggle("active")
            document.querySelector(".search-input input").focus()
        };

        const showSearchedList = function (event) {
            if (event.target.value.length > 0) {
                document.querySelector(".advanced-search").classList.add("active")
            } else {
                document.querySelector(".advanced-search").classList.remove("active")
            }
        };

        return {
            toggleSearchInput: toggleSearchInput,
            showSearchedList: showSearchedList,
        }
    };

    const CommentService = function () {
        const request = new Api().request;
        const articleCardTemplate = new ArticleCardTemplate();

        const addComment = function (event) {
            const message = event.target.closest("div");
            const articleIdSplits = message.id.split("-");
            const articleId = articleIdSplits[articleIdSplits.length - 1];

            const input = message.querySelector("input");
            const inputValue = input.value;
            const commentList = message.parentElement.querySelector(".comment-list");

            if (inputValue.length < 1 || inputValue.length > 500) {
                alert('댓글은 1글자 이상 500글자 이하로 입력해 주세요');
                return;
            }

            request
                .post('/' + articleId + '/comments/new', {contents: inputValue})
                .then(res => {
                    console.log(res);

                    const comment = articleCardTemplate.comment(res.data);
                    commentList.insertAdjacentHTML('beforeend', comment);
                    input.value = '';
                }).catch(err => {
                alert(err.response.data);
            });
        };

        return {
            addComment: addComment,
        }
    };

    const DdabongService = function () {
        const request = new Api().request;

        const toggleHeart = function (event) {
            event.preventDefault();
            const message = event.target.closest("div");
            const articleId = message.id;
            const childNodes = message.childNodes;
            const ddabongCountTag = childNodes[7].childNodes[3].childNodes[3];

            request
                .get('/articles/' + articleId + '/ddabongs')
                .then(response => {
                    console.log(response);
                    ddabongCountTag.innerText = response.data.count;

                    if (response.data.clicked === true) {
                        event.target.classList.remove('fa-heart-o');
                        event.target.classList.add('fa-heart', 'activated-heart');
                    } else {
                        event.target.classList.remove('fa-heart', 'activated-heart');
                        event.target.classList.add('fa-heart-o');
                    }
                });
        };

        return {
            toggleHeart: toggleHeart,
        }
    };

    const indexPageController = new IndexPageController();

    const init = function () {
        indexPageController.init();
    };

    const onscroll = function () {
        indexPageController.onscroll();
    };

    return {
        init: init,
        onscroll: onscroll,
    }
})();

INDEX_PAGE.init();

window.onscroll = function () {
    INDEX_PAGE.onscroll();
};