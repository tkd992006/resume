(() => {
  const caseLinks = [...document.querySelectorAll('[data-solved-issue]')];
  const imageButtons = [...document.querySelectorAll('[data-lightbox]')];
  const lightbox = document.getElementById('lightbox');
  const ownedEntries = new Set();
  let current = null;
  let entryNumber = 0;
  let routeFrame = 0;
  let closing = false;

  const currentUrl = () => location.pathname + location.search + location.hash;
  const syncScrollLock = () => document.documentElement.classList.toggle('has-modal', !!document.querySelector('dialog[open]'));
  const reveal = (element) => {
    if (element instanceof HTMLDetailsElement) element.open = true;
    for (let parent = element?.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
  };
  const focus = (element) => {
    if (!element?.isConnected) return;
    reveal(element);
    element.focus({ preventScroll: true });
  };
  const hashId = () => {
    try { return decodeURIComponent(location.hash.slice(1)); }
    catch { return ''; }
  };
  const routeTarget = () => {
    const id = hashId();
    const imageMatch = /^image-([1-9]\d*)$/.exec(id);
    if (imageMatch && lightbox) {
      const trigger = imageButtons[Number(imageMatch[1]) - 1];
      if (trigger) return { kind: 'image', dialog: lightbox, trigger, id };
    }
    const element = document.getElementById(id);
    const dialog = element?.closest('dialog.case-modal');
    if (dialog) return { kind: 'case', dialog, element, id };
    return { element, id };
  };
  const fallbackTrigger = (target) => (target.trigger?.hidden ? imageButtons.find(button => !button.hidden && button.dataset.gallery === target.trigger.dataset.gallery) : target.trigger) ?? caseLinks.find((link) => link.dataset.solvedIssue === target.dialog?.id);
  const triggerFromState = (state, target) => {
    if (!state || state.id !== target.id) return fallbackTrigger(target);
    return (state.kind === 'image' ? imageButtons : caseLinks)[state.triggerIndex] ?? fallbackTrigger(target);
  };

  const route = () => {
    closing = false;
    const target = routeTarget();
    const previous = current;
    const changesDialog = previous && (previous.dialog !== target.dialog);
    if (changesDialog) {
      current = null;
      if (previous.dialog.open) previous.dialog.close();
    }
    if (target.dialog) {
      const state = history.state?.standardModal;
      const trigger = triggerFromState(state, target);
      const returnHash = trigger?.closest('.project')?.id ?? 'projects';
      current = {
        ...target, trigger,
        origin: state?.id === target.id ? state.origin : location.pathname + location.search + '#' + returnHash,
        scroll: state?.id === target.id ? state.scroll : null,
      };
      if (target.kind === 'image') {
        const img = lightbox.querySelector('img');
        const media = target.trigger;
        img.src = media.dataset.lightbox;
        img.alt = media.querySelector('img')?.alt ?? '프로젝트 화면';
        const gallery = imageButtons.filter(button => button.dataset.gallery === media.dataset.gallery);
        lightbox.querySelector('#gallery-caption').textContent = img.alt;
        lightbox.querySelector('#gallery-position').textContent = `${gallery.indexOf(media) + 1} / ${gallery.length}`;
        lightbox.querySelectorAll('[data-gallery-step]').forEach(button => { button.hidden = gallery.length < 2; });
        lightbox.setAttribute('aria-label', img.alt + ' 크게 보기');
      }
      if (!target.dialog.open) {
        target.dialog.showModal();
        const content = target.dialog.querySelector('.case-modal-content');
        if (content) content.scrollTop = 0;
        focus(target.dialog.querySelector('[data-case-close], [data-lightbox-close]'));
      }
      if (target.element && target.element !== target.dialog) {
        reveal(target.element);
        target.element.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    } else {
      current = null;
      if (target.element) {
        reveal(target.element);
        if (!target.element.hasAttribute('tabindex')) target.element.setAttribute('tabindex', '-1');
        focus(target.element);
        target.element.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      if (previous && previous.origin === currentUrl()) {
        focus(previous.trigger);
        if (previous.scroll) window.scrollTo({ ...previous.scroll, behavior: 'instant' });
        else previous.trigger?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      }
    }
    syncScrollLock();
  };
  const scheduleRoute = () => {
    cancelAnimationFrame(routeFrame);
    routeFrame = requestAnimationFrame(route);
  };
  const navigate = (hash, modal) => {
    const state = { ...(history.state ?? {}) };
    delete state.standardModal;
    if (modal) {
      const key = `${Date.now()}-${++entryNumber}`;
      ownedEntries.add(key);
      state.standardModal = { ...modal, key, origin: currentUrl(), scroll: { left: scrollX, top: scrollY } };
    }
    if (location.hash === hash) history.replaceState(state, '', hash);
    else history.pushState(state, '', hash);
    route();
  };
  const dismiss = (dialog) => {
    if (!dialog.open || closing) return;
    if (current?.dialog !== dialog) { dialog.close(); syncScrollLock(); return; }
    const state = history.state?.standardModal;
    if (state && ownedEntries.has(state.key)) {
      closing = true;
      history.back();
    } else {
      const nextState = { ...(history.state ?? {}) };
      delete nextState.standardModal;
      history.replaceState(nextState, '', current.origin);
      route();
    }
  };

  const stepGallery = (step) => {
    if (current?.kind !== 'image') return;
    const media = routeTarget().trigger;
    const gallery = imageButtons.filter(button => button.dataset.gallery === media.dataset.gallery);
    if (gallery.length < 2) return;
    const next = gallery[(gallery.indexOf(media) + step + gallery.length) % gallery.length];
    const id = `image-${imageButtons.indexOf(next) + 1}`;
    const state = { ...(history.state ?? {}) };
    state.standardModal = { ...(state.standardModal ?? {}), kind: 'image', id,
      triggerIndex: imageButtons.indexOf(current.trigger), origin: current.origin, scroll: current.scroll };
    history.replaceState(state, '', '#' + id);
    route();
  };
  document.addEventListener('keydown', event => {
    if (current?.kind !== 'image' || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    stepGallery(event.key === 'ArrowRight' ? 1 : -1);
  });
  let touchStart = null;
  lightbox?.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  lightbox?.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) stepGallery(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const galleryStep = target?.closest('[data-gallery-step]');
    if (galleryStep) { event.preventDefault(); stepGallery(Number(galleryStep.dataset.galleryStep)); return; }
    const close = target?.closest('[data-case-close], [data-lightbox-close]');
    if (close) { event.preventDefault(); dismiss(close.closest('dialog')); return; }
    const issue = target?.closest('[data-solved-issue]');
    if (issue) {
      const id = issue.dataset.solvedIssue;
      if (!document.getElementById(id)?.matches('dialog.case-modal')) return;
      event.preventDefault();
      navigate('#' + encodeURIComponent(id), { kind: 'case', id, triggerIndex: caseLinks.indexOf(issue) });
      return;
    }
    const image = target?.closest('[data-lightbox]');
    if (image && lightbox) {
      event.preventDefault();
      const index = imageButtons.indexOf(image);
      const id = `image-${index + 1}`;
      navigate('#' + id, { kind: 'image', id, triggerIndex: index });
      return;
    }
    const link = target?.closest('a[href^="#"]');
    if (!link || link.hash.length < 2) return;
    event.preventDefault();
    navigate(link.hash);
  });

  document.querySelectorAll('dialog.case-modal, dialog.lightbox').forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); dismiss(dialog); });
    // Only a full gesture outside the dialog counts as a backdrop click.
    let startsOutside = false;
    const outside = (event) => {
      const box = dialog.getBoundingClientRect();
      return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    };
    dialog.addEventListener('pointerdown', (event) => { startsOutside = event.target === dialog && outside(event); });
    dialog.addEventListener('click', (event) => {
      if (startsOutside && event.target === dialog && outside(event)) dismiss(dialog);
      startsOutside = false;
    });
    dialog.addEventListener('close', syncScrollLock);
  });
  window.addEventListener('hashchange', scheduleRoute);
  window.addEventListener('popstate', scheduleRoute);
  route();
})();
