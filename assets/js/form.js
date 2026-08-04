function initWeb3Forms() {
  const forms = document.querySelectorAll('form[data-web3forms]');

  forms.forEach((form) => {
    if (form.dataset.web3formsInitialized === 'true') return;

    form.dataset.web3formsInitialized = 'true';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (form.dataset.submitting === 'true') return;

      const submitButton = form.querySelector('[type="submit"]');
      const status = form.querySelector('[data-form-status]');
      const originalButtonText = submitButton ? submitButton.textContent : '';

      form.dataset.submitting = 'true';
      form.setAttribute('aria-busy', 'true');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Отправляю…';
      }

      if (status) {
        status.textContent = 'Отправляем заявку…';
        status.classList.remove('is-success', 'is-error');
        status.classList.add('is-pending');
      }

      try {
        const formData = new FormData(form);
        formData.set('page_url', window.location.href);
        formData.set('page_title', document.title);
        formData.set('submitted_at', new Date().toLocaleString('ru-RU'));

        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        let result = null;

        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Не удалось прочитать ответ Web3Forms:', parseError);
        }

        if (!response.ok || result?.success !== true) {
          throw new Error(result?.message || `HTTP ${response.status}`);
        }

        if (status) {
          status.textContent = form.dataset.successMessage
            || 'Заявка отправлена. Мы свяжемся с вами по указанному контакту.';
          status.classList.remove('is-pending', 'is-error');
          status.classList.add('is-success');
        }

        const goalId = form.dataset.formGoal;

        if (goalId && typeof sendMetrikaGoal === 'function') {
          sendMetrikaGoal(goalId);
        }

        form.reset();

        if (form.dataset.successRedirect) {
          window.setTimeout(() => {
            window.location.assign(form.dataset.successRedirect);
          }, 600);
        }
      } catch (error) {
        console.error('Ошибка отправки Web3Forms:', error);

        if (status) {
          status.textContent = 'Не удалось отправить заявку. Данные сохранены — попробуйте ещё раз или свяжитесь с врачом указанным на сайте способом.';
          status.classList.remove('is-pending', 'is-success');
          status.classList.add('is-error');
        }
      } finally {
        form.dataset.submitting = 'false';
        form.removeAttribute('aria-busy');

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  });
}
