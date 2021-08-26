const deleteProduct = (btn) => {
  const container = btn.closest('article');
  const parent = container.parentNode;
  const csrf = container.querySelector('[name=_csrf]').value;
  const id = container.querySelector('[name=id').value;
  const imageFilename = container.querySelector('[name=imageFilename]').value;

  fetch(`/admin/product/${id}?imageFilename=${imageFilename}`, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
    body: {
      isAuthenticated: true,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      container.remove();
      if (!parent.childElementCount) {
        location.reload();
      }
    })
    .catch((err) => console.log(err));
};
