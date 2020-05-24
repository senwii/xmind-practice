import React, { useReducer } from "react"
import ReactDOM from 'react-dom'
import {
    BrowserRouter,
    Switch,
    Route,
    Redirect,
} from "react-router-dom"

import routes, { baseName } from './router'
import AppContext from './libs/context'
import reducer from './libs/reducer'

import './main.less'

function App() {
    const store = useReducer(reducer, {
        cateList: [],
        billList: [],
        cateGroupedBillList: [],
        month: new Date().getMonth() + 1,
        categoryId: '',
        income: '',
        expend: '',
        total: '',
        mode: 'byRecord',
        fixedSideBar: false,
    })
    return (
        <div className="root">
            <div className="copyright"><strong>© 2020 <a href="https://github.com/senwii">Senwii</a>.  All rights reserved.</strong></div>
            <AppContext.Provider value={store}>
                <BrowserRouter basename={baseName}>
                    <Switch>
                        {
                            routes.map((route, index) => (
                                <Route
                                    path={route.path}
                                    key={index}
                                    render={props => (
                                        <route.component {...props} routes={route.routes} />
                                    )}
                                />
                            ))
                        }
                        <Route path="/" exact>
                            <Redirect to="/byRecord" />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </AppContext.Provider>
        </div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('app'),
)
