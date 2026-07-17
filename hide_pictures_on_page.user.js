// ==UserScript==
// @name            一键隐藏图片优化版
// @namespace       https://github.com/zhangzc
// @version         0.6.2
// @author          zhangzc (基于原脚本修改)
// @description     摸鱼时页面显示与工作不相关的图片未免有些明目张胆，这时候就需要一键隐藏全图了。优化：三个互斥模式选项，大图片前添加换行，修复闪烁问题（无延迟）。本脚本基于 https://greasyfork.org/scripts/420682 修改，保留原 MIT 许可。
// @homepage        https://github.com/zhangzc/UserScript
// @icon            data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMACAYGBwYFCAcHBwkJCAoMFQ4MCwsMGRITDxUeGyAfHhsdHSElMCkhIy0kHR0qOSotMTM2NjYgKDs/OjQ+MDU2M//bAEMBCQkJDAsMGA4OGDMiHSIzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//AABEIABAAEAMBIgACEQEDEQH/xAAXAAADAQAAAAAAAAAAAAAAAAAABAUG/8QAIxAAAgICAgEEAwAAAAAAAAAAAQIDBAURITEGEhNBUWFxgf/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAHBEBAAEEAwAAAAAAAAAAAAAAAQACERExcZHh/9oADAMBAAIRAxEAPwDe5rOXLmYEMk9nH4ZZjX9+sR63fj5NtTpNhgNHsHf6drZH8HlKdZcw2Uo2pBCTIys0LkEjTKPkDrRB62D98lzGLRyEqZDGz5DGzTGWKSLZauTyysoIJXeyCAeyP7Pw/jT2fIjNDVkq4avMs0QsKRI7qrKAo3sINg7I2eufotcy8RM2KQ79n//Z
// @icon64          https://cdn.jsdelivr.net/gh/zhangzc/UserScript/assets/images/hide_pictures_on_page_64x64.jpg
// @supportURL      https://github.com/zhangzc/UserScript/issues/new/choose
// @license         MIT

// @match           *://*/*
// @exclude         /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
// @require         https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @run-at          document-start

// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue

// @note            2026/07/16 0.6.2 处理小图缩放的问题
// @note            2026/07/16 0.6.1 移除所有延迟操作，确保图片立即缩小，换行同步插入
// @note            2022/01/24 0.3.3 新功能：记忆特定网站习惯（如在www.baidu.com隐藏了图片，关闭浏览器下次再进入仍是默认隐藏。如需再次显示需要自行设置为显示）
// @note            2021/01/29 0.3.2 添加logo
// @note            2021/01/29 0.3.1 新功能：拖拽控制面板；控制面板位置记忆
// @note            2021/01/27 0.2.1 修复复选框点击无效问题；添加动图使用说明
// @note            2021/01/26 0.1   初版发布
// @downloadURL https://update.greasyfork.org/scripts/587327/%E4%B8%80%E9%94%AE%E9%9A%90%E8%97%8F%E5%9B%BE%E7%89%87%E4%BC%98%E5%8C%96%E7%89%88.user.js
// @updateURL https://update.greasyfork.org/scripts/587327/%E4%B8%80%E9%94%AE%E9%9A%90%E8%97%8F%E5%9B%BE%E7%89%87%E4%BC%98%E5%8C%96%E7%89%88.meta.js
// ==/UserScript==

(function () {
    "use strict";

    Array.prototype.indexOf = function (val) {
        for (var i = 0; i < this.length; i++) if (this[i] == val) return i;
        return -1;
    }
    Array.prototype.remove = function (val) {
        while (true) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            } else {
                break;
            }
        }
    }

    var hpop_config_custom;
    var hpop_config_default = {
        "version": "0.6.2",
        "sitesNormal": [],
        "sitesMiniMode": [],
        "sitesHide": [],
        "mode": "normal",
        "position": {
            "top": window.innerHeight / 2 - 14 + "",
            "left": "0",
            "right": "auto"
        },
        "largeImageThreshold": 200,
        "addLineBreakForLargeImage": true
    }

    const STYLE_RAW = "" +
        ".hpop-panel{" +
        "position:fixed;" +
        "width:64px;" +
        "height:20px;" +
        "font-size:12px;" +
        "font-weight: 500;" +
        "font-family:Verdana, Arial, '宋体';" +
        "background:#f1f1f1;" +
        "z-index:2147483647;" +
        "margin: 0;" +
        "opacity:0.4;" +
        "transition:0.3s;" +
        "overflow:hidden;" +
        "user-select:none;" +
        "text-align:left;" +
        "white-space:nowrap;" +
        "line-height:20px;" +
        "padding:3px 6px;" +
        "border:1px solid #ccc;" +
        "box-sizing: content-box;" +
        "}" +
        ".hpop-panel-left{" +
        "transform:translate(-63px,0);" +
        "border-width:1px 1px 1px 0;" +
        "border-top-right-radius: 14px;" +
        "border-bottom-right-radius: 14px;" +
        "}" +
        ".hpop-panel-right{" +
        "transform:translate(63px,0);" +
        "border-width:1px 0 1px 1px;" +
        "border-top-left-radius: 14px;" +
        "border-bottom-left-radius: 14px;" +
        "padding-left: 10px;" +
        "padding-right: 0;" +
        "}" +
        ".hpop-panel input[type='radio']{" +
        "margin: 0 3px 0 0;" +
        "padding: 0;" +
        "vertical-align:middle;" +
        "-webkit-appearance:radio;" +
        "-moz-appearance:radio;" +
        "position: static;" +
        "clip: auto;" +
        "opacity: 1;" +
        "cursor: pointer;" +
        "}" +
        ".hpop-panel.hpop-panel-active{" +
        "width:120px;" +
        "height:60px;" +
        "opacity: 0.9;" +
        "}" +
        ".hpop-panel.hpop-panel-left-active{" +
        "left: 0px;" +
        "transform:translate(0,0);" +
        "}" +
        ".hpop-panel.hpop-panel-right-active{" +
        "right: 0px;" +
        "transform:translate(0,0);" +
        "}" +
        ".hpop-panel label{" +
        "margin:0;" +
        "padding:0 0 0 3px;" +
        "font-weight:500;" +
        "cursor:pointer;" +
        "}" +
        ".hpop-panel-move{" +
        "border-width:1px 1px 1px 0;" +
        "border-radius: 14px;" +
        "}" +
        ".hpop-option{" +
        "display:block;" +
        "height:20px;" +
        "line-height:20px;" +
        "}" +
        ".hpop-mini-img{" +
        "position:relative !important;" +
        "z-index:2147483646 !important;" +
        "transition:all 0.3s ease-in-out !important;" +
        "}" +
        ".hpop-mini-mode{" +
        "max-width:20px !important;" +
        "max-height:20px !important;" +
        "opacity:0.3 !important;" +
        "filter:blur(1px) !important;" +
        "overflow:hidden !important;" +
        "}" +
        ".hpop-mini-hover{" +
        "max-width:none !important;" +
        "max-height:none !important;" +
        "opacity:1 !important;" +
        "filter:none !important;" +
        "z-index:2147483647 !important;" +
        "}" +
        " ";

    main();

    function main() {
        hpop_config_custom = GM_getValue("hpop_config");
        if (!hpop_config_custom) {
            hpop_config_custom = hpop_config_default;
        }
        var updFlag = false;
        for (var _key in hpop_config_default) {
            if (!hpop_config_custom.hasOwnProperty(_key)) {
                hpop_config_custom[_key] = hpop_config_default[_key];
                updFlag = true;
            }
        }
        if (updFlag) {
            GM_setValue("hpop_config", hpop_config_custom);
        }
        generateControlPanel();
    }

    function generateControlPanel() {
        var node = document.createElement("hide-pictures-on-page");
        node.id = "hpop-panel";
        if (hpop_config_custom.position.left == 0) {
            node.className = "hpop-panel hpop-panel-left";
        }
        if (hpop_config_custom.position.right == 0) {
            node.className = "hpop-panel hpop-panel-right";
        }
        node.style.cssText = "position:fixed;top:" + hpop_config_custom.position.top + "px;"
            + "left:" + hpop_config_custom.position.left + "px;"
            + "right:" + hpop_config_custom.position.right + "px;";

        node.innerHTML =
            "<div class='hpop-option'>" +
            "  <input type='radio' name='hpop-mode' id='hpop-normal' value='normal' />" +
            "  <label for='hpop-normal'>不启用</label>" +
            "</div>" +
            "<div class='hpop-option'>" +
            "  <input type='radio' name='hpop-mode' id='hpop-mini' value='mini' />" +
            "  <label for='hpop-mini'>迷你图片</label>" +
            "</div>" +
            "<div class='hpop-option'>" +
            "  <input type='radio' name='hpop-mode' id='hpop-hide' value='hide' />" +
            "  <label for='hpop-hide'>全隐图片</label>" +
            "</div>";

        if (window.self === window.top) {
            if (document.querySelector("body")) {
                document.body.appendChild(node);
            } else {
                document.documentElement.appendChild(node);
            }
        }

        var _style = document.createElement("style");
        _style.type = "text/css";
        _style.innerHTML = STYLE_RAW;
        if (document.querySelector("#hpop-panel")) {
            document.querySelector("#hpop-panel").appendChild(_style);
        } else {
            GM_addStyle(STYLE_RAW);
        }

        var currentHostname = document.location.hostname;
        var currentMode = "normal";
        if (hpop_config_custom.sitesNormal.indexOf(currentHostname) > -1) {
            currentMode = "normal";
        } else if (hpop_config_custom.sitesMiniMode.indexOf(currentHostname) > -1) {
            currentMode = "mini";
        } else if (hpop_config_custom.sitesHide.indexOf(currentHostname) > -1) {
            currentMode = "hide";
        } else {
            currentMode = hpop_config_custom.mode;
        }

        var modeRadio = document.querySelector("#hpop-" + currentMode);
        if (modeRadio) {
            modeRadio.checked = true;
        }

        $(document).ready(function() {
            applyMode(currentMode);
        });

        node.addEventListener("mouseover", function () {
            node.classList.add("hpop-panel-active");
            if (hpop_config_custom.position.left == 0) {
                node.classList.add("hpop-panel-left-active");
            }
            if (hpop_config_custom.position.right == 0) {
                node.classList.add("hpop-panel-right-active");
            }
        });
        node.addEventListener("mouseleave", function () {
            setTimeout(function () {
                node.classList.remove("hpop-panel-active");
                node.classList.remove("hpop-panel-left-active");
                node.classList.remove("hpop-panel-right-active");
            }, 300);
        });

        node.addEventListener("mousedown", function (event) {
            node.style.transition = "null";
            var dispX = event.clientX - node.offsetLeft;
            var dispY = event.clientY - node.offsetTop;

            var move = function (event) {
                node.classList.add("hpop-panel-move");
                node.style.left = event.clientX - dispX + "px";
                node.style.top = event.clientY - dispY + "px";
            }

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", function () {
                node.classList.remove("hpop-panel-move");
                node.style.transition = "0.3s";
                document.removeEventListener("mousemove", move);
                var bodyWidth = document.body.clientWidth;
                var hpop_nodeWidth = node.offsetLeft + node.offsetWidth / 2;
                if (hpop_nodeWidth > bodyWidth / 2) {
                    node.style.left = "auto";
                    node.style.right = 0;
                    node.classList.remove("hpop-panel-left");
                    node.classList.add("hpop-panel-right");
                    hpop_config_custom.position.left = "auto";
                    hpop_config_custom.position.right = "0";
                } else {
                    node.style.left = hpop_config_custom.position.left = 0;
                    node.style.right = hpop_config_custom.position.right = "auto";
                    node.classList.add("hpop-panel-left");
                    node.classList.remove("hpop-panel-right");
                }
                hpop_config_custom.position.top = node.offsetTop;
                GM_setValue("hpop_config", hpop_config_custom);
            });
        });

        var radioButtons = document.querySelectorAll("input[name='hpop-mode']");
        radioButtons.forEach(function(radio) {
            radio.addEventListener("click", function() {
                var selectedMode = this.value;
                applyMode(selectedMode);
                var currentHostname = document.location.hostname;
                hpop_config_custom.sitesNormal.remove(currentHostname);
                hpop_config_custom.sitesMiniMode.remove(currentHostname);
                hpop_config_custom.sitesHide.remove(currentHostname);
                if (selectedMode === "normal") {
                    hpop_config_custom.sitesNormal.push(currentHostname);
                } else if (selectedMode === "mini") {
                    hpop_config_custom.sitesMiniMode.push(currentHostname);
                } else if (selectedMode === "hide") {
                    hpop_config_custom.sitesHide.push(currentHostname);
                }
                GM_setValue("hpop_config", hpop_config_custom);
            });
        });
    }

    // 补插换行（同步）
    function ensureLineBreakForImage(img) {
        if (!hpop_config_custom.addLineBreakForLargeImage) return;
        if (img.hasAttribute("data-hpop-linebreak-added")) return;

        var width = img.naturalWidth || img.width || img.offsetWidth;
        var height = img.naturalHeight || img.height || img.offsetHeight;
        if (width === 0 || height === 0) return;

        var threshold = hpop_config_custom.largeImageThreshold || 200;
        if (width > threshold && height > threshold) {
            var br = document.createElement("br");
            br.style.cssText = "display: block; clear: both; margin: 10px 0;";
            br.className = "hpop-linebreak";
            if (img.parentNode) {
                img.parentNode.insertBefore(br, img);
                img.setAttribute("data-hpop-linebreak-added", "true");
            }
        }
    }

    // 处理单个图片（仅大图缩小）
	function processImage(img) {
		var $img = $(img);
		if ($img.data("hpop-processed")) return;

		// 先获取图片尺寸
		var width = img.naturalWidth || img.width || img.offsetWidth;
		var height = img.naturalHeight || img.height || img.offsetHeight;

		// 如果尺寸为 0（图片尚未加载完成），等加载完再重试
		if (width === 0 || height === 0) {
			if (!img.complete) {
				img.addEventListener("load", function onLoad() {
					processImage(img);
					img.removeEventListener("load", onLoad);
				});
			}
			return;
		}

		var threshold = hpop_config_custom.largeImageThreshold || 200;

		// 只有宽高都大于阈值时才做缩小处理
		if (width <= threshold || height <= threshold) {
			// 小图片：不做任何处理，直接返回
			return;
		}

		// 标记已处理
		$img.data("hpop-processed", true);

		// 立即缩小（只对大图片）
		$img.addClass("hpop-mini-img hpop-mini-mode");

		// 鼠标进入：补插换行 + 放大
		$img.on("mouseenter.hpop", function() {
			ensureLineBreakForImage(img);
			$img.removeClass("hpop-mini-mode").addClass("hpop-mini-hover");
		}).on("mouseleave.hpop", function() {
			$img.removeClass("hpop-mini-hover").addClass("hpop-mini-mode");
		});

		// 如果图片已加载，立即检查换行
		if (img.complete) {
			ensureLineBreakForImage(img);
		} else {
			img.addEventListener("load", function onLoad() {
				ensureLineBreakForImage(img);
				img.removeEventListener("load", onLoad);
			});
		}
	}

    function applyMode(mode) {
        removeAllEffects();
        switch(mode) {
            case "normal":
                $("img").show("500");
                break;
            case "mini":
                $("img").each(function() { processImage(this); });
                observeImages();
                break;
            case "hide":
                $("img").hide("500");
                break;
        }
    }

    function removeAllEffects() {
        $("img").show("500");
        $("img").removeClass("hpop-mini-img hpop-mini-mode hpop-mini-hover");
        $("img").off(".hpop");
        $("img").removeData("hpop-processed");
        $("img").removeAttr("data-hpop-linebreak-added");
        $(".hpop-linebreak").remove();
        if (window._hpopObserver) {
            window._hpopObserver.disconnect();
            delete window._hpopObserver;
        }
    }

    function observeImages() {
        if (window._hpopObserver) {
            window._hpopObserver.disconnect();
        }
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    $(mutation.addedNodes).find("img").each(function() {
                        var currentMode = document.querySelector("input[name='hpop-mode']:checked")?.value;
                        if (currentMode === "mini") {
                            processImage(this);
                        }
                    });
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        window._hpopObserver = observer;
    }

})();
