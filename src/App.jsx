import styled from "@emotion/styled"
import { DatePicker, LocalizationProvider } from "@mui/lab"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material"
import { DataGrid, GridOverlay } from "@mui/x-data-grid"
import axios from "axios"
import { format, parseISO } from "date-fns"
import ruLocale from "date-fns/locale/ru"
import { useEffect, useRef, useState } from "react"

const StyledDataGrid = styled(DataGrid)`
  &.MuiDataGrid-root {
    border: none;
  }
  &.MuiDataGrid-root .MuiDataGrid-cell:focus-within,
  &.MuiDataGrid-root .MuiDataGrid-columnHeader:focus-within {
    outline: none;
  }
  &.MuiDataGrid-root .MuiDataGrid-columnSeparator {
    visibility: hidden;
  }
  &.MuiDataGrid-root .MuiDataGrid-columnHeader--sortable {
    cursor: default;
  }
`
const StyledBox = styled(Box)`
  & .MuiDataGrid-root .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer {
    width: auto;
    visibility: visible;
  }
  &
    .MuiDataGrid-root
    .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted)
    .MuiDataGrid-sortIcon {
    opacity: 0.5;
  }
`

const recordsPerPage = [10, 25, 50, 100, 200]
const eventNames = ["", "Лицо не найдено", "Успешный вход"]

export default function App() {
  const [records, setRecords] = useState([])
  const [searchText, setSearchText] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [event, setEvent] = useState("")
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [loading, setLoading] = useState(false)
  const totalPages = useRef(null)
  const [sortingMode, setSortingMode] = useState({ field: "time", sort: "desc" })

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const { data, headers } = await axios.get("http://localhost:5000/records", {
          params: {
            _limit: limit,
            _page: page,
            _sort: sortingMode.field,
            _order: sortingMode.sort,
            ...(searchText.trim() ? { q: searchText.trim() } : {}),
            ...(event ? { event } : {}),
            ...(dateFrom instanceof Date && !isNaN(dateFrom)
              ? { time_gte: dateFrom }
              : {}),
            ...(dateTo instanceof Date && !isNaN(dateTo) ? { time_lte: dateTo } : {}),
          },
        })
        // Fake api delay
        setTimeout(() => {
          totalPages.current = headers["x-total-count"]
          setRecords(data)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [dateFrom, dateTo, event, limit, page, searchText, sortingMode])

  const resetFilters = () => {
    setSearchText("")
    setDateFrom(null)
    setDateTo(null)
    setEvent("")
  }

  const columns = [
    {
      field: "image",
      headerName: "",
      width: 150,
      sortable: false,
      renderCell: ({ value }) => <Avatar src={value} variant="square" />,
    },
    { field: "name", headerName: "Имя", width: 250 },
    { field: "login", headerName: "Логин", width: 250 },
    {
      field: "time",
      headerName: "Время",
      width: 200,
      valueFormatter: ({ value }) => format(parseISO(value), "dd.MM.yyyy - hh:mm:ss"),
    },
    { field: "event", headerName: "Тип события", width: 200 },
    {
      field: "temperature",
      headerName: "Температура",
      width: 300,
      renderCell: () => (
        <Stack direction="row" spacing={1} width="100%">
          <Button disabled fullWidth size="small" sx={{ backgroundColor: "#3a3b3c" }} />
          <Button color="success" disabled fullWidth size="small" variant="contained">
            Сохранить
          </Button>
        </Stack>
      ),
    },
  ]

  return (
    <Paper style={{ padding: "15px" }}>
      <h2>Список событий</h2>
      <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={1}>
        <TextField
          label={searchText ? "Поиск" : null}
          onChange={(evt) => setSearchText(evt.target.value)}
          placeholder="Поиск..."
          size="small"
          sx={{ width: "25%" }}
          value={searchText}
        />
        <span>Дата с</span>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
          <DatePicker
            label={dateFrom ? "дд.мм.гггг" : null}
            mask="__.__.____"
            onChange={(value) => setDateFrom(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps,
                  placeholder: "дд.мм.гггг",
                }}
                size="small"
              />
            )}
            value={dateFrom}
          />
        </LocalizationProvider>
        <span>по</span>
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
          <DatePicker
            label={dateTo ? "дд.мм.гггг" : null}
            mask="__.__.____"
            onChange={(value) => setDateTo(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps,
                  placeholder: "дд.мм.гггг",
                }}
                size="small"
              />
            )}
            value={dateTo}
          />
        </LocalizationProvider>
        <FormControl sx={{ width: "20%" }}>
          {!event && <InputLabel size="small">Выберите событие</InputLabel>}
          <Select
            label={!event ? "Выберите событие" : null}
            onChange={(evt) => setEvent(evt.target.value)}
            size="small"
            value={event}
          >
            {eventNames.map((event) => (
              <MenuItem key={event} value={event}>
                {event || "Все события"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          color="success"
          onClick={resetFilters}
          size="medium"
          style={{ marginLeft: "auto" }}
          variant="contained"
        >
          Сбросить
        </Button>
      </Stack>
      <Stack alignItems="flex-start" direction="column" mt={1} spacing={1}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          mt={1}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Button color="success" disabled size="small" variant="contained">
            Показать ошибки
          </Button>
          <Button color="success" disabled size="small" variant="contained">
            Выгрузить данные
          </Button>
          <Button color="error" disabled size="small" variant="contained">
            Выгрузить ошибки
          </Button>
        </Stack>
        <FormControl>
          <Select
            onChange={(evt) => {
              setLimit(evt.target.value)
              setPage(1)
            }}
            size="small"
            value={limit}
          >
            {recordsPerPage.map((record) => (
              <MenuItem key={record} value={record}>
                {record}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <StyledBox sx={{ height: 578, width: "100%" }}>
          <StyledDataGrid
            columns={columns}
            components={{
              NoRowsOverlay: () => (
                <Stack alignItems="center" height="100%" justifyContent="center">
                  Нет результатов
                </Stack>
              ),
              LoadingOverlay: () => (
                <GridOverlay>
                  <Stack sx={{ position: "absolute", top: 0, width: "100%" }}>
                    <LinearProgress />
                  </Stack>
                </GridOverlay>
              ),
            }}
            disableColumnMenu
            hideFooter
            loading={loading}
            onColumnHeaderClick={(_, evt) => {
              if (evt.target.tagName === "DIV") {
                evt.defaultMuiPrevented = true
              }
            }}
            onSortModelChange={(model) => {
              setSortingMode(model[0])
            }}
            rows={records}
            sortModel={[sortingMode]}
            sortingMode="server"
            sortingOrder={["asc", "desc"]}
          />
        </StyledBox>
        {!!records.length && (
          <Pagination
            count={Math.ceil(totalPages.current / limit)}
            onChange={(_, pageNumber) => setPage(pageNumber)}
            page={page}
            shape="rounded"
          />
        )}
      </Stack>
    </Paper>
  )
}
