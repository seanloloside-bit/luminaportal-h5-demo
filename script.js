const appTitle = document.querySelector("#appTitle");
const screen = document.querySelector(".screen");
const welcomeView = document.querySelector("#welcomeView");
const projectView = document.querySelector("#projectView");
const captureView = document.querySelector("#captureView");
const outfitView = document.querySelector("#outfitView");
const homeView = document.querySelector("#homeView");
const flowView = document.querySelector("#flowView");
const assetsView = document.querySelector("#assetsView");
const messageView = document.querySelector("#messageView");
const communityView = document.querySelector("#communityView");
const flowPanel = document.querySelector("#flowPanel");
const flowTitle = document.querySelector("#flowTitle");
const flowEyebrow = document.querySelector("#flowEyebrow");
const progressDots = [...document.querySelectorAll(".progress-dot")];
const mainViews = [
  welcomeView,
  projectView,
  captureView,
  outfitView,
  homeView,
  flowView,
  assetsView,
  messageView,
  communityView,
];

const modes = {
  template: {
    eyebrow: "方式 1 · 低客单价",
    title: "模板快拍",
    step: "templateStep",
  },
  blind: {
    eyebrow: "方式 2 · 限量售卖",
    title: "盲盒婚照",
    step: "blindStep",
  },
  story: {
    eyebrow: "方式 3 · 自然语言定制",
    title: "故事问答",
    step: "storyStep",
  },
  upload: {
    eyebrow: "方式 4 · 场景上传",
    title: "上传场景照",
    step: "uploadStep",
  },
};

let currentMode = "template";

const templateCatalog = {
  solid: {
    defaultSub: "retroRed",
    subs: [
      { id: "retroRed", name: "复古红底", desc: "迎宾照、长辈展示", theme: "solid-red" },
      { id: "blueRomance", name: "蓝色浪漫", desc: "干净高级、冷调氛围", theme: "solid-blue" },
      { id: "orangeLove", name: "橙色之恋", desc: "温暖活泼、适合请柬", theme: "solid-orange" },
      { id: "whiteLover", name: "白色恋人", desc: "极简纯净、适合相框", theme: "solid-white" },
    ],
  },
  outdoor: {
    defaultSub: "frenchGarden",
    subs: [
      { id: "frenchGarden", name: "法式田园", desc: "花园、午后、松弛感", theme: "outdoor-garden" },
      { id: "mountainLake", name: "高山湖泊", desc: "开阔、清透、旅行感", theme: "outdoor-lake" },
      { id: "seaLove", name: "大海情缘", desc: "海风、落日、度假感", theme: "outdoor-sea" },
      { id: "grassStory", name: "草地物语", desc: "自然、轻盈、野餐感", theme: "outdoor-grass" },
      { id: "gardenLove", name: "园林爱意", desc: "中式园林、含蓄浪漫", theme: "outdoor-park" },
    ],
  },
};

let selectedTemplate = {
  category: "solid",
  sub: "retroRed",
  variant: 1,
};
let templatePickerLevel = "category";
let selectedTemplates = ["复古红底 1"];
let navigationStack = [];
let selectedFinalPhotos = [];
let unlockedAssets = [];
let favoriteAssets = [];
const unlockUnitPrice = 29.9;
let dailyFreeCredits = 3;
let generationCoupons = 0;
let retouchCoupons = 0;
let selectedProject = "wedding";
let familyMemberCount = 3;
let claimedInviteRewards = new Set();

function showView(view, title) {
  const currentView = mainViews.find((item) => item.classList.contains("active"));
  if (currentView && currentView !== view) {
    navigationStack.push({ type: "view", view: currentView, title: appTitle.textContent });
  }
  showViewDirect(view, title);
}

function showViewDirect(view, title) {
  mainViews.forEach((item) => item.classList.remove("active"));
  view.classList.add("active");
  appTitle.textContent = title;
  screen.classList.toggle("studio-ready", view === homeView || view === flowView);
  screen.classList.toggle("welcome-mode", view === welcomeView);
  updateBottomNav(view);
}

function showWelcome() {
  showView(welcomeView, "LET AI BE AI");
  setProgress(0);
}

function showProject() {
  showView(projectView, "先选择你要拍摄的项目");
  renderGrowthStatus();
  setProgress(0);
}

function showCapture() {
  renderCaptureForProject();
  showView(captureView, "3分钟，先看到你们的第一组婚照");
  setProgress(0);
}

function showOutfit() {
  showView(outfitView, "先试穿，再决定拍哪套");
  setProgress(0);
}

function showShootModes() {
  showView(homeView, "今晚先拍一组属于你们的婚照");
  setProgress(0);
}

function showHome() {
  showView(projectView, "先选择你要拍摄的项目");
  setProgress(0);
}

function showCreate() {
  showView(captureView, "开始拍摄或上传头像");
  setProgress(0);
}

function showAssets() {
  showView(assetsView, "资产");
  renderAssets();
  renderFavorites();
  renderWallet();
  setProgress(0);
}

function showMessages() {
  showView(messageView, "消息");
  setProgress(0);
}

function showCommunity() {
  showView(communityView, "发现");
  setProgress(0);
}

function showMall() {
  flowEyebrow.textContent = "商城";
  flowTitle.textContent = "婚礼物料商城";
  showView(flowView, "选择要制作的物料");
  renderStep("shopStep");
  setProgress(3);
  document.querySelectorAll("[data-nav]").forEach((button) => button.classList.remove("active"));
  document.querySelector('[data-nav="shop"]')?.classList.add("active");
}

function openMode(mode) {
  currentMode = mode;
  const config = modes[mode];
  flowEyebrow.textContent = config.eyebrow;
  flowTitle.textContent = config.title;
  const activeStep = flowPanel.dataset.step;
  if (flowView.classList.contains("active") && activeStep) {
    navigationStack.push({ type: "step", step: activeStep, eyebrow: flowEyebrow.textContent, title: flowTitle.textContent });
  }
  showView(flowView, config.title);
  renderStep(config.step);
  setProgress(1);
}

function renderStep(templateId) {
  flowPanel.dataset.step = templateId;
  const template = document.querySelector(`#${templateId}`);
  flowPanel.replaceChildren(template.content.cloneNode(true));
  if (templateId === "resultStep") {
    renderFinalPhotos();
  }
  if (templateId === "shopStep") {
    renderShopAssets();
  }
  bindPanelActions();
}

function bindPanelActions() {
  flowPanel.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.next;
      if (next === "home") {
        showShootModes();
        return;
      }
      if (next === "shop" && flowPanel.dataset.step === "resultStep") {
        syncSelectedFinalPhotos();
        if (!selectedFinalPhotos.length) {
          updateUnlockPrice();
          return;
        }
        saveSelectedPhotosToAssets();
      }
      if (next === "result") {
        consumeGenerationCredit();
      }
      navigationStack.push({
        type: "step",
        step: flowPanel.dataset.step,
        eyebrow: flowEyebrow.textContent,
        title: flowTitle.textContent,
      });
      renderStep(`${next}Step`);
      setProgress(next === "result" || next === "shop" ? 3 : 2);
    });
  });

  flowPanel.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.group;
      flowPanel.querySelectorAll(`.chip[data-group="${group}"]`).forEach((item) => {
        item.classList.remove("selected");
      });
      chip.classList.add("selected");
    });
  });

  flowPanel.querySelectorAll(".template-card").forEach((card) => {
    card.addEventListener("click", () => {
      flowPanel.querySelectorAll(".template-card").forEach((item) => {
        item.classList.remove("selected");
      });
      card.classList.add("selected");
    });
  });

  if (flowPanel.querySelector(".template-picker")) {
    bindTemplatePicker();
  }

  flowPanel.querySelectorAll(".final-photo-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("selected");
      syncSelectedFinalPhotos();
      updateUnlockPrice();
    });
  });

  const regenButton = flowPanel.querySelector("#regenBtn");
  if (regenButton) {
    regenButton.addEventListener("click", () => {
      if (retouchCoupons > 0) {
        retouchCoupons -= 1;
        renderGrowthStatus();
      }
      regenButton.textContent = "已提交微调";
      regenButton.classList.add("used");
      regenButton.disabled = true;
      const card = regenButton.closest(".regen-card");
      card.querySelector("span").textContent = "已保留原图，并为你们微调表情和氛围。正式产品里建议每单只送 1 次。";
    });
  }

  flowPanel.querySelectorAll(".material-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("selected");
    });
  });

  const uploader = flowPanel.querySelector("#sceneUpload");
  if (uploader) {
    uploader.addEventListener("change", () => {
      const box = uploader.closest(".upload-box");
      const fileName = uploader.files?.[0]?.name || "已选择场景照";
      box.querySelector("strong").textContent = fileName;
      box.querySelector("em").textContent = "已进入场景美化与多角度推理预处理";
    });
  }
}

function goBack() {
  const previous = navigationStack.pop();
  if (!previous) {
    showShootModes();
    return;
  }

  if (previous.type === "view") {
    showViewDirect(previous.view, previous.title);
    return;
  }

  flowEyebrow.textContent = previous.eyebrow;
  flowTitle.textContent = previous.title;
  showViewDirect(flowView, previous.title);
  renderStep(previous.step);
  setProgress(previous.step === "resultStep" || previous.step === "shopStep" ? 3 : 1);
}

function bindTemplatePicker() {
  templatePickerLevel = "category";
  renderSubOptions();
  renderVariants();
  updateTemplateLevel();
  updateSelectedTemplateRail();

  flowPanel.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTemplate.category = button.dataset.category;
      selectedTemplate.sub = templateCatalog[selectedTemplate.category].defaultSub;
      selectedTemplate.variant = 1;
      templatePickerLevel = "sub";

      flowPanel.querySelectorAll("[data-category]").forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      renderSubOptions();
      renderVariants();
      updateTemplateLevel();
      updateSelectedTemplateRail();
    });
  });

  flowPanel.querySelector("#templateBackBtn").addEventListener("click", () => {
    if (templatePickerLevel === "variant") {
      templatePickerLevel = "sub";
    } else if (templatePickerLevel === "sub") {
      templatePickerLevel = "category";
    }
    updateTemplateLevel();
  });
}

function renderSubOptions() {
  const list = flowPanel.querySelector("#subOptionList");
  if (!list) return;

  const catalog = templateCatalog[selectedTemplate.category];
  list.replaceChildren(
    ...catalog.subs.map((sub) => {
      const button = document.createElement("button");
      button.className = `picker-option${sub.id === selectedTemplate.sub ? " selected" : ""}`;
      button.type = "button";
      button.dataset.sub = sub.id;
      button.innerHTML = `<strong>${sub.name}</strong><em>${sub.desc}</em>`;
      button.addEventListener("click", () => {
        selectedTemplate.sub = sub.id;
        selectedTemplate.variant = 1;
        templatePickerLevel = "variant";
        renderSubOptions();
        renderVariants();
        updateTemplateLevel();
        updateSelectedTemplateRail();
      });
      return button;
    }),
  );
}

function renderVariants() {
  const grid = flowPanel.querySelector("#variantGrid");
  if (!grid) return;

  const sub = getCurrentSub();
  grid.replaceChildren(
    ...[1, 2, 3, 4].map((number) => {
      const button = document.createElement("button");
      const templateName = `${sub.name} ${number}`;
      button.className = `variant-card ${sub.theme}${selectedTemplates.includes(templateName) ? " selected" : ""}`;
      button.type = "button";
      button.dataset.tag = number === 1 ? "推荐" : `样式 ${number}`;
      button.innerHTML = `<strong>${sub.name} ${number}</strong><em>点击勾选此模板</em>`;
      button.addEventListener("click", () => {
        selectedTemplate.variant = number;
        toggleSelectedTemplate(templateName);
        renderVariants();
        updateSelectedTemplateRail();
      });
      return button;
    }),
  );
}

function updateTemplateLevel() {
  const picker = flowPanel.querySelector(".template-picker");
  if (!picker) return;
  picker.dataset.level = templatePickerLevel;
  flowPanel.querySelector("#templateBackBtn").disabled = templatePickerLevel === "category";
}

function toggleSelectedTemplate(templateName) {
  if (selectedTemplates.includes(templateName)) {
    selectedTemplates = selectedTemplates.filter((item) => item !== templateName);
  } else {
    selectedTemplates = [...selectedTemplates, templateName];
  }
}

function getCurrentSub() {
  return templateCatalog[selectedTemplate.category].subs.find((sub) => sub.id === selectedTemplate.sub);
}

function updateSelectedTemplateRail() {
  const list = flowPanel.querySelector("#selectedTemplateList");
  const desc = flowPanel.querySelector("#selectedTemplateDesc");
  if (!list || !desc) return;

  list.replaceChildren(
    ...(selectedTemplates.length ? selectedTemplates : ["还未选择模板"]).map((item) => {
      const strong = document.createElement("strong");
      strong.textContent = item;
      return strong;
    }),
  );
  desc.textContent = selectedTemplates.length
    ? `已选择 ${selectedTemplates.length} 个模板，可一起生成预览`
    : "可多选，最后一起生成预览";
}

function renderFinalPhotos() {
  const list = flowPanel.querySelector("#finalPhotoList");
  if (!list) return;

  const templates = selectedTemplates.length ? selectedTemplates : ["推荐模板"];
  selectedFinalPhotos = [`${templates[0]} 成片 1`];
  list.replaceChildren(
    ...templates.map((templateName, templateIndex) => {
      const group = document.createElement("section");
      group.className = "final-template-group";

      const title = document.createElement("div");
      title.className = "final-template-title";
      title.innerHTML = `<strong>${templateName}</strong><span>生成 3 张成片候选</span>`;

      const grid = document.createElement("div");
      grid.className = "final-photo-grid";

      [1, 2, 3].forEach((number) => {
        const button = document.createElement("button");
        const styleClass = number === 1 ? "photo" : number === 2 ? "photo alt" : "photo cool";
        const photoName = `${templateName} 成片 ${number}`;
        button.className = `final-photo-card ${styleClass}${selectedFinalPhotos.includes(photoName) ? " selected" : ""}`;
        button.type = "button";
        button.dataset.photoName = photoName;
        button.innerHTML = `<span>${number === 1 ? "效果 1" : number === 2 ? "效果 2" : "效果 3"}</span><strong>${photoName}</strong>`;
        grid.append(button);
      });

      group.append(title, grid);
      return group;
    }),
  );
  updateUnlockPrice();
}

function syncSelectedFinalPhotos() {
  selectedFinalPhotos = [...flowPanel.querySelectorAll(".final-photo-card.selected")]
    .map((card) => card.dataset.photoName)
    .filter(Boolean);
}

function updateUnlockPrice() {
  const price = flowPanel.querySelector("#unlockPrice");
  if (!price) return;

  const count = selectedFinalPhotos.length;
  price.textContent =
    count > 0
      ? `已选 ${count} 张高清图 · 合计 ￥${(count * unlockUnitPrice).toFixed(1)}`
      : "请选择要解锁的高清图";
}

function saveSelectedPhotosToAssets() {
  syncSelectedFinalPhotos();
  if (!selectedFinalPhotos.length) return;

  const existing = new Set(unlockedAssets.map((asset) => asset.name));
  selectedFinalPhotos.forEach((name) => {
    if (!existing.has(name)) {
      unlockedAssets.push({ name, note: "已解锁高清图 · 可制作婚礼物料" });
    }
  });
  renderAssets();
}

function renderAssets() {
  const list = document.querySelector("#assetList");
  const empty = document.querySelector(".asset-empty");
  if (!list || !empty) return;

  empty.style.display = unlockedAssets.length ? "none" : "block";
  list.replaceChildren(
    ...unlockedAssets.map((asset) => {
      const card = document.createElement("div");
      card.className = "asset-card";
      card.innerHTML = `
        <span class="photo-thumb garden"></span>
        <div>
          <strong>${asset.name}</strong>
          <em>${asset.note}</em>
        </div>
      `;
      return card;
    }),
  );
}

function renderFavorites() {
  const list = document.querySelector("#favoriteList");
  const empty = document.querySelector(".favorite-empty");
  if (!list || !empty) return;

  empty.style.display = favoriteAssets.length ? "none" : "block";
  list.replaceChildren(
    ...favoriteAssets.map((favorite) => {
      const card = document.createElement("div");
      card.className = "favorite-card";
      card.innerHTML = `
        <span>${favorite.type}</span>
        <strong>${favorite.title}</strong>
        <em>${favorite.note}</em>
      `;
      return card;
    }),
  );
}

function addFavoriteFromButton(button) {
  const card = button.closest(".feed-card");
  if (!card) return;

  const title = card.querySelector("p strong, .feed-user strong")?.textContent || "收藏内容";
  const note = card.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim() || "已收藏到资产";
  const type = button.dataset.originText?.replace("收藏", "") || "收藏";
  const favorite = {
    title,
    type: `发现 · ${type}`,
    note: note.length > 52 ? `${note.slice(0, 52)}...` : note,
  };

  button.dataset.favoriteTitle = favorite.title;
  if (!favoriteAssets.some((item) => item.title === favorite.title)) {
    favoriteAssets.push(favorite);
  }
}

function removeFavoriteFromButton(button) {
  const title = button.dataset.favoriteTitle;
  if (!title) return;
  favoriteAssets = favoriteAssets.filter((item) => item.title !== title);
}

function renderShopAssets() {
  const picker = flowPanel.querySelector("#shopAssetPicker");
  if (!picker) return;

  const assets = unlockedAssets.length
    ? unlockedAssets
    : [{ name: "请先解锁高清图", note: "从成片预览页解锁后会出现在这里" }];

  picker.replaceChildren(
    ...assets.map((asset, index) => {
      const button = document.createElement("button");
      button.className = `shop-asset-card${index === 0 && unlockedAssets.length ? " selected" : ""}`;
      button.type = "button";
      button.innerHTML = `<span class="photo-thumb garden"></span><strong>${asset.name}</strong><em>${asset.note}</em>`;
      button.addEventListener("click", () => {
        if (!unlockedAssets.length) return;
        button.classList.toggle("selected");
      });
      return button;
    }),
  );
}

function renderInviteBalance() {
  document.querySelectorAll("#inviteBalance").forEach((balance) => {
    balance.textContent = `当前可用生成券 ${dailyFreeCredits + generationCoupons} 张`;
  });
}

function bindInviteActions() {
  document.querySelectorAll("[data-invite]").forEach((button) => {
    if (claimedInviteRewards.has(button.dataset.invite)) {
      button.textContent = "已获得 +2";
      button.disabled = true;
    }

    button.addEventListener("click", () => {
      if (button.disabled) return;
      claimedInviteRewards.add(button.dataset.invite);
      generationCoupons += 2;
      renderGrowthStatus();
      renderWallet();
      renderInviteBalance();
      button.textContent = "已获得 +2";
      button.disabled = true;
    });
  });
}

function bindOnboarding() {
  document.querySelector("#startBtn").addEventListener("click", showProject);
  document.querySelector("#chooseProjectBtn").addEventListener("click", showCapture);
  document.querySelector("#toOutfitBtn").addEventListener("click", showOutfit);
  document.querySelector("#enterStudioBtn").addEventListener("click", showShootModes);

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".project-card").forEach((item) => {
        item.classList.remove("selected");
      });
      card.classList.add("selected");
      selectedProject = card.dataset.project || "wedding";
      document.querySelector("#chooseProjectBtn").textContent = `选择${card.querySelector("strong").textContent}，继续`;
    });
  });

  document.querySelectorAll("[data-person]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);
      const person = input.dataset.person;
      input.closest(".portrait-card").querySelector("img").src = previewUrl;

      const tryonAlt = person === "male" ? "男生试衣形象" : "女生试衣形象";
      document.querySelectorAll(`.tryon-person img[alt="${tryonAlt}"]`).forEach((image) => {
        image.src = previewUrl;
      });
    });
  });

  document.querySelectorAll(".outfit-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".outfit-card").forEach((item) => {
        item.classList.remove("selected");
      });
      card.classList.add("selected");
    });
  });

  document.querySelectorAll(".closet-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".closet-card").forEach((item) => {
        item.classList.remove("selected");
      });
      card.classList.add("selected");
    });
  });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const nav = button.dataset.nav;
      if (nav === "home") showProject();
      if (nav === "community") showCommunity();
      if (nav === "shop") showMall();
      if (nav === "create") showCreate();
      if (nav === "assets") showAssets();
    });
  });

  document.querySelectorAll(".community-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".community-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  document.querySelectorAll(".like-action").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "已喜欢" : button.dataset.originText || "喜欢";
    });
    button.dataset.originText = button.textContent;
  });

  document.querySelectorAll(".collect-action").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "已收藏" : button.dataset.originText;
      if (button.classList.contains("active")) {
        addFavoriteFromButton(button);
      } else {
        removeFavoriteFromButton(button);
      }
      renderFavorites();
    });
    button.dataset.originText = button.textContent;
  });

  document.querySelectorAll(".create-action").forEach((button) => {
    button.addEventListener("click", showCreate);
  });

  document.querySelectorAll(".shop-jump-action").forEach((button) => {
    button.addEventListener("click", showMall);
  });

  document.querySelectorAll(".contribute-action").forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "已提交入口";
      button.classList.add("active");
      generationCoupons += 1;
      renderGrowthStatus();
    });
  });

  document.querySelectorAll(".task-chip").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("done")) return;
      if (button.dataset.reward === "generation") generationCoupons += 1;
      if (button.dataset.reward === "retouch") retouchCoupons += 1;
      button.textContent = "已领取奖励";
      button.classList.add("done");
      renderGrowthStatus();
    });
  });

  document.querySelector("#messageBtn").addEventListener("click", showMessages);

  document.querySelectorAll("[data-wallet]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.wallet === "recharge") generationCoupons += 10;
      if (button.dataset.wallet === "gift") generationCoupons += 3;
      renderGrowthStatus();
      renderWallet();
      button.textContent = button.dataset.wallet === "recharge" ? "已充值 +10" : "已赠送 +3";
    });
  });

  bindInviteActions();

}

function renderCaptureForProject() {
  const title = document.querySelector("#captureTitle");
  const desc = document.querySelector("#captureDesc");
  const first = document.querySelector('[data-portrait-card="first"]');
  const second = document.querySelector('[data-portrait-card="second"]');
  const third = document.querySelector('[data-portrait-card="third"]');
  const addFamilyMemberBtn = document.querySelector("#addFamilyMemberBtn");
  if (!title || !desc || !first || !second || !third) return;

  const setCard = (card, label, action) => {
    card.querySelector("[data-portrait-label]").textContent = label;
    card.querySelector("[data-portrait-action]").textContent = action;
  };

  document.querySelectorAll("[data-extra-family]").forEach((card) => card.remove());
  familyMemberCount = 3;
  second.classList.remove("hidden");
  third.classList.add("hidden");
  addFamilyMemberBtn?.classList.add("hidden");
  if (addFamilyMemberBtn) {
    addFamilyMemberBtn.onclick = () => addFamilyMemberCard(addFamilyMemberBtn);
    addFamilyMemberBtn.querySelector("strong").textContent = "添加更多成员";
    addFamilyMemberBtn.querySelector("em").textContent = "4 口 / 5 口之家可补充";
  }

  if (selectedProject === "baby") {
    title.textContent = "上传家庭成员人像，和宝宝一起拍";
    desc.textContent = "默认上传爸爸、妈妈和宝宝；如果是 4 口 / 5 口之家，点击 + 补充家庭成员。";
    setCard(first, "爸爸入口 · 已示范", "拍 / 传爸爸正脸");
    setCard(second, "妈妈入口 · 已示范", "拍 / 传妈妈正脸");
    setCard(third, "宝宝入口 · 已示范", "拍 / 传宝宝正脸");
    third.classList.remove("hidden");
    addFamilyMemberBtn?.classList.remove("hidden");
    return;
  }

  if (selectedProject === "silver") {
    title.textContent = "上传两位长辈人像";
    desc.textContent = "上传两张清晰正脸，为父母或长辈生成一组银发之恋纪念照。";
    setCard(first, "第一位入口 · 已示范", "拍 / 传第一位正脸");
    setCard(second, "第二位入口 · 已示范", "拍 / 传第二位正脸");
    return;
  }

  if (selectedProject === "portrait") {
    title.textContent = "上传写真人像";
    desc.textContent = "上传 1 张清晰正脸，先生成低清预览，喜欢再解锁高清。";
    setCard(first, "主角入口 · 已示范", "拍 / 传主角正脸");
    second.classList.add("hidden");
    return;
  }

  title.textContent = "先把你们放进婚照里";
  desc.textContent = "上传两张清晰正脸，马上预览穿上婚纱西装后的样子。";
  setCard(first, "男生入口 · 已示范", "拍 / 传男生正脸");
  setCard(second, "女生入口 · 已示范", "拍 / 传女生正脸");
}

function addFamilyMemberCard(addButton) {
  if (document.querySelector("[data-extra-family]")) return;

  familyMemberCount += 1;
  const card = document.createElement("label");
  card.className = "portrait-card";
  card.dataset.extraFamily = "true";
  card.innerHTML = `
    <input type="file" accept="image/*" data-person="familyExtra" />
    <img src="assets/female-model.jpg" alt="更多家庭成员人像示例" />
    <span data-portrait-label>更多家庭成员 · 可选</span>
    <strong data-portrait-action>拍 / 传补充成员正脸</strong>
  `;
  addButton.before(card);
  bindPortraitInput(card.querySelector("input"));
  addButton.classList.add("hidden");
}

function bindPortraitInput(input) {
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const person = input.dataset.person;
    input.closest(".portrait-card").querySelector("img").src = previewUrl;

    const tryonAlt = person === "male" ? "男生试衣形象" : "女生试衣形象";
    document.querySelectorAll(`.tryon-person img[alt="${tryonAlt}"]`).forEach((image) => {
      image.src = previewUrl;
    });
  });
}

function consumeGenerationCredit() {
  if (dailyFreeCredits > 0) {
    dailyFreeCredits -= 1;
  } else if (generationCoupons > 0) {
    generationCoupons -= 1;
  }
  renderGrowthStatus();
}

function renderGrowthStatus() {
  const daily = document.querySelector("#dailyCredits");
  const coupons = document.querySelector("#couponCount");
  if (daily) daily.textContent = `免费生成 ${dailyFreeCredits} 次`;
  if (coupons) coupons.textContent = `生成券 ${generationCoupons} · 微调券 ${retouchCoupons}`;
  renderInviteBalance();
}

function updateBottomNav(view) {
  document.querySelectorAll("[data-nav]").forEach((button) => button.classList.remove("active"));
  if (view === projectView || view === welcomeView) {
    document.querySelector('[data-nav="home"]')?.classList.add("active");
  } else if (view === communityView) {
    document.querySelector('[data-nav="community"]')?.classList.add("active");
  } else if (view === assetsView || view === messageView) {
    document.querySelector('[data-nav="assets"]')?.classList.add("active");
  } else if (view === captureView || view === outfitView || view === homeView) {
    document.querySelector('[data-nav="create"]')?.classList.add("active");
  }
}

function renderWallet() {
  const wallet = document.querySelector("#assetWalletBalance");
  if (!wallet) return;
  wallet.textContent = `余额 ${dailyFreeCredits + generationCoupons} 张`;
}

function setProgress(step) {
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index < step);
  });
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => openMode(button.dataset.mode));
});

document.querySelector("#backBtn").addEventListener("click", goBack);
document.querySelector("#resetBtn").addEventListener("click", () => {
  navigationStack = [];
  showWelcome();
});

bindOnboarding();
showWelcome();
renderGrowthStatus();
renderWallet();
