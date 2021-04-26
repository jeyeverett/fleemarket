
const get404Error = (req, res) => {
    res.status(404).render('404', { pageTitle: 'Error 404 | Page Not Found', path: '404' });
}

module.exports = {
    get404Error
}