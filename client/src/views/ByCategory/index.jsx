import React, { useState, useEffect, useContext } from 'react'
import {
    Paper,
    FormControl,
    Table,
    TableBody,
    TableHead,
    TableCell,
    TableRow,
} from '@material-ui/core'
import { EcoOutlined } from '@material-ui/icons'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import SideBar from '../../components/SideBar/index.jsx'
import RouteTab from '../../components/RouteTab/index.jsx'
import DateFnsUtils from '@date-io/date-fns'
import { zhCN as zhLocale } from 'date-fns/locale'

import AppContext from '../../libs/context'

import './page.less'

export default function ByCategoryPage() {
    const [appState, dispatch] = useContext(AppContext)

    const { cateGroupedBillList, month, income, expend, total } = appState

    const year = new Date().getFullYear()

    const [monthDate, setMonthDate] = useState(`${year}-${month}-01`)

    useEffect(() => {
        dispatch({
            type: 'getSortMonthRevenue',
            params: {
                dispatch,
                month,
            },
        })

        dispatch({
            type: 'updateState',
            payload: {
                mode: 'byCategory',
            },
        })
    }, [])

    return (
        <div className="bycategory-page-root">
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={zhLocale}>
                <SideBar />
                <div className="paper-container">
                    <Paper>
                        <RouteTab />
                        <div className="filter-line">
                            <FormControl>
                                <DatePicker
                                    variant="inline"
                                    views={['month']}
                                    label="月份"
                                    format="M月"
                                    autoOk={true}
                                    disableToolbar={true}
                                    initialFocusedDate={new Date()}
                                    invalidLabel="月份不合法"
                                    value={monthDate}
                                    onChange={date => {
                                        const newMonth = new Date(date).getMonth() + 1

                                        dispatch({
                                            type: 'updateState',
                                            payload: {
                                                month: newMonth,
                                            },
                                        })

                                        dispatch({
                                            type: 'getSortMonthRevenue',
                                            params: {
                                                dispatch,
                                                month: newMonth,
                                            },
                                        })

                                        setMonthDate(date)
                                    }}
                                />
                            </FormControl>
                        </div>
                        <Table
                            stickyHeader={true}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">排序</TableCell>
                                    <TableCell align="left">金额</TableCell>
                                    <TableCell align="center">类型</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    cateGroupedBillList?.length > 0 && cateGroupedBillList.map((listitem, index) => {
                                        const { accumulation, categoryId, categoryName, type } = listitem
                                        return (
                                            <TableRow key={categoryId}>
                                                <TableCell align="left">{ index + 1 }</TableCell>
                                                <TableCell align="center">
                                                    <div className="td-amount">
                                                        <span className={ type === 0 ? 'icon expend-icon' : 'icon income-icon'} />
                                                        <span>{ accumulation }</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">{ categoryName }</TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                        {
                            cateGroupedBillList?.length > 0 &&
                            <div className="calc-line">
                                <span className="calc-result income">
                                    <span className="money">{ income || '0.00' }</span>
                                    <span className="suffix">(收)</span>
                                </span>
                                <span className="calc-result expend">
                                    <span className="minus">&zwnj;</span>
                                    <span className="money">{ expend || '0.00' }</span>
                                    <span className="suffix">(支)</span>
                                </span>
                                <span className="calc-result total">
                                    <span className="equal">&zwnj;</span>
                                    <span className="money">{ total || '0.00' }</span>
                                    <span className="suffix">(总)</span>
                                </span>
                            </div>
                        }
                        {
                            cateGroupedBillList?.length === 0 &&
                            <div className="table-empty"><EcoOutlined />当前月份没有账单</div>
                        }
                    </Paper>
                </div>
            </MuiPickersUtilsProvider>
        </div>
    )
}
