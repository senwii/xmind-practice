import React, { useState, useEffect, useContext } from 'react'
import {
    Paper,
    Button,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    Table,
    TableBody,
    TableHead,
    TableCell,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core'
import { AddCircle, EcoOutlined, Delete } from '@material-ui/icons'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import AddBillDialog from '../../components/AddBillDialog/index.jsx'
import SideBar from '../../components/SideBar/index.jsx'
import RouteTab from '../../components/RouteTab/index.jsx'
import DateFnsUtils from '@date-io/date-fns'
import { zhCN as zhLocale } from 'date-fns/locale'

import { ALL_CATEGORY_ITEM } from '../../libs/constants'
import AppContext from '../../libs/context'

import './page.less'

export default function ByRecordPage() {
    const [categoryId, setCategoryId] = useState(ALL_CATEGORY_ITEM.id)
    const [chosenBillId, setChosenBillId] = useState('')
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [openDelDialog, setOpenDelDialog] = useState(false)
    const [appState, dispatch] = useContext(AppContext)

    const { cateList, billList, month, income, expend, total } = appState

    const year = new Date().getFullYear()

    const [monthDate, setMonthDate] = useState(`${year}-${month}-01`)

    useEffect(() => {
        dispatch({
            type: 'updateState',
            payload: {
                mode: 'byRecord',
            },
        })

        dispatch({
            type: 'getBillList',
            params: {
                dispatch,
                month,
                categoryId: null,
            },
        })

        dispatch({
            type: 'getCategoryList',
            params: {
                dispatch,
            },
        })
    }, [])

    return (
        <div className="byrecord-page-root">
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
                                            type: 'getBillList',
                                            params: {
                                                dispatch,
                                                month: newMonth,
                                                categoryId,
                                            }
                                        })

                                        setMonthDate(date)
                                    }}
                                />
                            </FormControl>
                            <FormControl>
                                <InputLabel shrink id="bill-category-select-label">账单类型</InputLabel>
                                <Select
                                    labelId="bill-category-select-label"
                                    value={categoryId}
                                    onChange={evt => {
                                        const month = new Date(monthDate).getMonth() + 1
                                        const newCategoryId = evt.target.value

                                        dispatch({
                                            type: 'updateState',
                                            payload: {
                                                categoryId: newCategoryId,
                                            },
                                        })

                                        dispatch({
                                            type: 'getBillList',
                                            params: {
                                                dispatch,
                                                month,
                                                categoryId: newCategoryId,
                                            }
                                        })

                                        setCategoryId(newCategoryId)
                                    }}
                                >
                                    <MenuItem value={ALL_CATEGORY_ITEM.id}>{ALL_CATEGORY_ITEM.name}</MenuItem>
                                    {
                                        cateList?.length > 0 && cateList.map(cateitem => (
                                            <MenuItem value={cateitem.id} key={cateitem.id}>{cateitem.name}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <Button
                                size="small"
                                color="primary"
                                variant="contained"
                                startIcon={<AddCircle />}
                                onClick={() => setOpenAddDialog(true)}
                            >新增</Button>
                        </div>
                        <Table
                            stickyHeader={true}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">类型</TableCell>
                                    <TableCell align="left">金额</TableCell>
                                    <TableCell align="center">时间</TableCell>
                                    <TableCell align="right">操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    billList?.length > 0 && billList.map(billitem => {
                                        const { id, categoryName, amount, time, type } = billitem
                                        return (
                                            <TableRow key={id}>
                                                <TableCell align="left">{ categoryName }</TableCell>
                                                <TableCell align="center">
                                                    <div className="td-amount">
                                                        <span className={ type === 0 ? 'icon expend-icon' : 'icon income-icon'} />
                                                        <span>{ amount }</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">{ new Date(time).toLocaleString() }</TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        color="secondary"
                                                        variant="outlined"
                                                        startIcon={<Delete />}
                                                        onClick={() => {
                                                            setChosenBillId(id)
                                                            setOpenDelDialog(true)
                                                        }}
                                                    >删除</Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                        {
                            billList?.length > 0 &&
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
                            billList?.length === 0 &&
                            <div className="table-empty"><EcoOutlined />当前月份没有账单</div>
                        }
                        {
                            openAddDialog && <AddBillDialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} />
                        }
                        {
                            <Dialog
                                className="del-bill-dialog"
                                open={openDelDialog}
                                onClose={() => setOpenDelDialog(false)}
                            >
                                <DialogTitle>确认删除</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>删除后不可恢复，是否确认删除该账单？</DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="contained" color="primary" onClick={() => {
                                        dispatch({
                                            type: 'deleteBill',
                                            params: {
                                                dispatch,
                                                id: chosenBillId,
                                                month: new Date(monthDate).getMonth() + 1,
                                                categoryId,
                                            },
                                        })
                                        setOpenDelDialog(false)
                                    }}>删除</Button>
                                    <Button variant="outlined" color="primary" onClick={() => setOpenDelDialog(false)}>取消</Button>
                                </DialogActions>
                            </Dialog>
                        }
                    </Paper>
                </div>
            </MuiPickersUtilsProvider>
        </div>
    )
}
