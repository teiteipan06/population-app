import React, { Component, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from "axios";

import './App.css';


type CountyData = {
    prefCode: number,
    prefName: string
}

class App extends Component<{}, any> {
  private apiKey: string;
  constructor(props: any) {
    super(props);
    this.apiKey = 'iU8pDksKkXV735k1sVltWpSWLPjAy9SC0UGhecTq';
      this.state = {
      selected: Array<CountyData>,
      prefectures: Array<CountyData>,
      series: []
    };
    this.changeSelect = this.changeSelect.bind(this);
  }

  componentDidMount() {
    // 47都道府県の一覧を取得
    // API Doc: https://opendata.resas-portal.go.jp/docs/api/v1/prefectures.html
      axios('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': this.apiKey }
    })
      .then(response => {
          const res = response.data;
          this.setState({ prefectures: res.result,  selected: Array(res.result.length).fill(false)});
      })
  }

  changeSelect(index: any) {
    // @ts-ignore
    const selected_copy = this.state.selected.slice();
    // selectedの真偽値を反転
    selected_copy[index] = !selected_copy[index];
    if (!this.state.selected[index]) {
      // チェックされていなかった場合はデータを取得
      // API Doc: https://opendata.resas-portal.go.jp/docs/api/v1/population/sum/perYear.html
      axios(
          `https://opendata.resas-portal.go.jp/api/v1/population/sum/perYear?cityCode=-&prefCode=${index + 1}`,
          {
            headers: { 'X-API-KEY': this.apiKey }
          }
      )
      .then(response => {
        const res = response.data;
        let tmp: any[] = [];
        Object.keys(res.result.line.data).forEach(i => {
          tmp.push(res.result.line.data[i].value);
        });
        const res_series = {
          name: this.state.prefectures[index].prefName,
          data: tmp
        };
        this.setState({
          selected: selected_copy,
          series: [...this.state.series, res_series]
        });
      });
    } else {
      // @ts-ignore
      const series_copy = this.state.series.slice();
      // チェック済みの場合はseriesから削除
      series_copy.forEach((item: {name: string, data: any[]}, i: number) => {
        if (item.name == this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      });
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderItem(props: any) {
    return (
        <div
            key={props.prefCode}
            style={{ margin: '5px', display: 'inline-block' }}
        >
          <input
              type="checkbox"
              checked={this.state.selected[props.prefCode - 1]}
              onChange={() => this.changeSelect(props.prefCode - 1)}
          />
          {props.prefName}
        </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: '人口増減率'
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointInterval: 5,
          pointStart: 1965
        }
      },
      series: this.state.series
    };
    return (
      <div className="App">
        {Object.keys(obj).map(i => this.renderItem(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default App;
