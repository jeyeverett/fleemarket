
const getError404 = (req, res) => {
    return res.status(404).render('404', 
        { 
            pageTitle: 'Error 404 | Page Not Found', 
            path: '404'
        });
}


const getError500 = (req, res) => {
    return res.status(500).render('500', 
        { 
            pageTitle: 'Error 500 | Server-Side Error', 
            path: '500'
        });
}

module.exports = {
    getError404,
    getError500
}