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
  const fallbackTrigger = (target) => target.trigger ?? caseLinks.find((link) => link.dataset.solvedIssue === target.dialog?.id);
  const triggerFromState = (state, target) => {
    if (!state || state.id !== target.id) return fallbackTrigger(target);
    return (state.kind === 'image' ? imageButtons : caseLinks)[state.triggerIndex] ?? fallbackTrigger(target);
  };

  const route = () => {
    closing = false;
    const target = routeTarget();
    const previous = current;
    const changesDialog = previous && (previous.dialog !== target.dialog || previous.id !== target.id);
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
        img.src = trigger.dataset.lightbox;
        img.alt = trigger.querySelector('img')?.alt ?? '프로젝트 화면';
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

  document.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
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
