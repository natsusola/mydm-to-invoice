<template>
  <div class="content">
    <h2>發票系統</h2>
    <form name="form" @submit.prevent>
      <div class="form-group row">
        <label for="p-file" class="col-3 col-form-label">CSV 檔</label>
        <div class="col-9">
          <input class="form-control"
            type="file" id="p-file"
            ref="fileInput"
            accept=".csv"
            @change="onUploadFile($event)"/>
        </div>
      </div>
      <div class="form-group row">
        <label for="p-date" class="col-3 col-form-label">訂單日期</label>
        <div class="col-9">
          <input class="form-control" type="date" id="p-date" v-model="form.date"/>
        </div>
      </div>
      <div class="form-group row">
        <label for="p-name" class="col-3 col-form-label">品名</label>
        <div class="col-9">
          <input class="form-control" type="text" id="p-name" v-model.trim="form.name"/>
        </div>
      </div>
      <div class="form-group row">
        <label for="p-tax-type" class="col-3 col-form-label">課稅別</label>
        <div class="col-9">
          <select class="form-control" name="p-tax-type" v-model="form.taxType">
            <option
              v-for="taxType in options.taxTypes"
              :value="taxType.val">
              {{taxType.val + ' : ' + taxType.name}}
            </option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label for="p-inv-type" class="col-3 col-form-label">發票方式</label>
        <div class="col-9">
          <select class="form-control" name="p-inv-type" v-model="form.invType">
            <option
              v-for="invType in options.invTypes"
              :value="invType.val">
              {{invType.val + ' : ' + invType.name}}
            </option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label for="p-payway" class="col-3 col-form-label">付款方式</label>
        <div class="col-9">
          <select class="form-control" name="p-payway" v-model="form.payway">
            <option
              v-for="payway in options.payways"
              :value="payway.val">
              {{payway.val + ' : ' + payway.name}}
            </option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label for="p-love" class="col-3 col-form-label">愛心碼</label>
        <div class="col-9">
          <input class="form-control" type="text" id="p-love" v-model.trim="form.love"/>
        </div>
      </div>
    </form>
    <div>
      <button class="btn btn-primary" style="width: 100%"
        @click="doTransfer()">
        轉換
      </button>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import XLSX from 'xlsx';
  import Papa from 'papaparse';
  import { saveAs } from 'file-saver';

  const CSV_COL_MAP = {
    INVOCE_NUM: 2,
    PRODUCT_NUM: 3,
    BUYER_NAME: 5,
    COUNT: 7,
    PRICE: 8
  };

  const XLS_TITLES = [
    '訂單編號', '訂單日期', '買方名稱', '買方統編', '電話/手機', '買方地址', '買方Email',
    '產品編號', '品名', '數量', '單價', '課稅別', '捐贈/紙本', '付款方式', '備註', '載具',
    '載具編號', '愛心碼'
  ];

  function s2ab(s) {
    let _buf = new ArrayBuffer(s.length);
    let _view = new Uint8Array(_buf);
    for (let i = 0; i != s.length; ++i) _view[i] = s.charCodeAt(i) & 0xFF;
    return _buf;
  }

  export default {
    name: 'home',
    data() {
      return {
        form: {
          date: moment().format('YYYY-MM-DD'),
          name: '同人誌',
          taxType: '1',
          invType: '1',
          payway: '4',
          love: '9118595'
        },
        csvData: [],
        options: {
          taxTypes: [
            { val: '1', name: '應稅' },
            { val: '2', name: '零稅率(非海關出口)' },
            { val: '3', name: '免稅' },
            { val: '5', name: '零稅率(經海關出口)' }
          ],
          invTypes: [
            { val: '0', name: '載具' },
            { val: '1', name: '捐贈' },
            { val: '2', name: '紙本' },
          ],
          payways: [
            { val: '1', name: '現金' },
            { val: '2', name: 'ATM' },
            { val: '3', name: '信用卡' },
            { val: '4', name: '超商代收' },
            { val: '5', name: '其他' },
          ]
        }
      };
    },
    methods: {
      onUploadFile(e) {
        if (e.target.files[0]) {
          Papa.parse(e.target.files[0], {
            complete: res => { this.csvData = [...res.data]; }
          });
        } else { this.csvData = []; }
      },
      doTransfer() {
        let _csvData = this.csvData;
        if (!_csvData.length) {
          alert('請選擇 .csv 檔案！');
          return;
        }

        let _wb = { SheetNames: [], Sheets: {} };
        let _wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
        let _data = [[...XLS_TITLES]];
        let _ws;
        let _dateStr = moment(this.form.date).format('YYYY/MM/DD');
        
        _csvData.forEach((d, i)=> {
          if (i < 2 || !d[CSV_COL_MAP.INVOCE_NUM]) return;
          let _ary = [];
          if (_ary[0] = d[CSV_COL_MAP.INVOCE_NUM] !== '--') {
            _ary[0] = d[CSV_COL_MAP.INVOCE_NUM];
            _ary[1] = _dateStr;
            _ary[2] = d[CSV_COL_MAP.BUYER_NAME];
          } else { _ary[0] = ''; }
          _ary[7] = d[CSV_COL_MAP.PRODUCT_NUM];
          _ary[8] = this.form.name;
          _ary[9] = parseInt(d[CSV_COL_MAP.COUNT]);
          _ary[10] = parseInt(d[CSV_COL_MAP.PRICE]);
          _ary[11] = this.form.taxType;
          _ary[12] = this.form.invType;
          _ary[13] = this.form.payway;
          _ary[17] = this.form.love;
          _data.push(_ary);
        });

        _ws = XLSX.utils.aoa_to_sheet(_data);
        _wb.SheetNames.push('Sheet1');
        _wb.Sheets['Sheet1'] = _ws;
        let _wbout = XLSX.write(_wb, _wopts);
        saveAs(
          new Blob([s2ab(_wbout)], { type:"application/octet-stream" }),
          `${moment().format('YYYYMMDDHHmm')}.xls`
        );
      }
    }
  }
</script>
