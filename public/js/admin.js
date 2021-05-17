const deleteProduct = (btn) => {
    const container = btn.parentNode.parentNode;
    const csrf = container.querySelector('[name=_csrf').value;
    const id = container.querySelector('[name=id').value;
    const imageUrl = container.querySelector('[name=imageUrl').value;
    const productElement = container.closest('article');

    fetch(`/admin/product/${id}?imageUrl=${imageUrl}`, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        },
        body: {
            isAuthenticated: true
        }
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        console.log(data);
        productElement.remove();
    })
    .catch(err => console.log(err));
};