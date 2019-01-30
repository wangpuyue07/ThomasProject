import React, {PureComponent} from 'react';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  Input,
  Popover,
  Table, Divider
} from 'antd';
import {connect} from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DebtForm from './DebtForm';
import InvestmentForm from './InvestmentForm';
import SpendingForm from './SpendingForm';
import DecumulationForm from './DecumulationForm';
import styles from './style.less';
import moment from 'moment';

const {Column, ColumnGroup} = Table;
const fieldLabels = {
  name: 'Your Name'
};

/*const DebtData = [];
const InvestmentData = [];
const SpendingData = [];
const DecumulationData = [];*/

const DebtData = [
  {
    key: 1,
    loanAmount: 10000,
    rate: 10,
    duration: 36,
    baloonPayment: 0,
    SDate: moment('2015-06', 'YYYY-MM')
  },
  {
    key: 2,
    loanAmount: 10000,
    rate: 10,
    duration: 36,
    baloonPayment: 0,
    SDate: moment('2015-06', 'YYYY-MM')
  }
];

const InvestmentData = [
  {
    key: 1,
    openBalance: 20000,
    rate: 9,
    contribution: 200,
    duration: 36,
    SDate: moment('2019-01', 'YYYY-MM')
  },
  {
    key: 2,
    openBalance: 5000,
    rate: 12,
    contribution: 300,
    duration: 36,
    SDate: moment('2019-02', 'YYYY-MM')
  }
];

const SpendingData = [
  {
    key: 1,
    amount: 800,
    SDate: moment('2019-01', 'YYYY-MM')
  },
  {
    key: 2,
    amount: 3000,
    SDate: moment('2019-04', 'YYYY-MM')
  },
  {
    key: 3,
    amount: 15000,
    SDate: moment('2019-05', 'YYYY-MM')
  }
];

const DecumulationData = [
  {
    key: 1,
    amount: 800,
    duration: 36,
    SDate: moment('2015-06', 'YYYY-MM')
  },
  {
    key: 2,
    amount: 600,
    duration: false,
    SDate: moment('2014-12', 'YYYY-MM')
  }
];

@connect(({loading}) => ({
  submitting: loading.effects['form/submitAdvancedForm']
}))
@Form.create()
class AdvancedForm extends PureComponent {
  state = {
    width: '100%'
  };

  componentDidMount () {
    window.addEventListener('resize', this.resizeFooterToolbar, {passive: true});
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  getErrorInfo = () => {
    const {
      form: {getFieldsError}
    } = this.props;
    const errors = getFieldsError();
    const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = fieldKey => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = Object.keys(errors).map(key => {
      if (!errors[key]) {
        return null;
      }
      return (
        <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
          <Icon type="cross-circle-o" className={styles.errorIcon}/>
          <div className={styles.errorMessage}>{errors[key][0]}</div>
          <div className={styles.errorField}>{fieldLabels[key]}</div>
        </li>
      );
    });
    return (
      <span className={styles.errorIcon}>
        <Popover
          title="表单校验信息"
          content={errorList}
          overlayClassName={styles.errorPopover}
          trigger="click"
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Icon type="exclamation-circle"/>
        </Popover>
        {errorCount}
      </span>
    );
  };

  resizeFooterToolbar = () => {
    requestAnimationFrame(() => {
      const sider = document.querySelectorAll('.ant-layout-sider')[0];
      if (sider) {
        const width = `calc(100% - ${sider.style.width})`;
        const {width: stateWidth} = this.state;
        if (stateWidth !== width) {
          this.setState({width});
        }
      }
    });
  };

  generateData = (value) => {
    var rawData = {};
    var startDate = 0, endDate = 0;
    rawData.debts = [];
    rawData.investments = [];
    rawData.spendings = [];
    rawData.decumulations = [];
    rawData.length = 0;
    value.debt.forEach(debt => {
      (debt.SDate < startDate || startDate == 0) && (startDate = debt.SDate);
      (moment(debt.SDate).add(debt.duration, 'M') > endDate || endDate == 0) && (endDate = moment(debt.SDate).add(debt.duration, 'M'));
    });
    value.invest.forEach(investment => {
      (investment.SDate < startDate || startDate == 0) && (startDate = moment(investment.SDate));
      if (investment.duration) {
        (moment(investment.SDate).add(investment.duration, 'M') > endDate || endDate == 0) && (endDate = moment(investment.SDate).add(investment.duration, 'M'));
      }
    });
    value.spend.forEach((spending, index) => {
      (spending.SDate < startDate || startDate == 0) && (startDate = moment(spending.SDate));
      (spending.SDate > endDate || endDate == 0) && (endDate = moment(spending.SDate));
    });
    value.decumulation.forEach(decumulation => {
      (decumulation.SDate < startDate || startDate == 0) && (startDate = moment(decumulation.SDate));
      if (decumulation.duration) {
        (moment(decumulation.SDate).add(decumulation.duration, 'M') > endDate || endDate == 0) && (endDate = moment(decumulation.SDate).add(decumulation.duration, 'M'));
      }
    });
    var reset = moment(startDate);
    value.debt.forEach((debt, fuck) => {
      var debtContainer = [];
      while (!startDate.isAfter(endDate)) {
        if (startDate.format('MMM YYYY') == debt.SDate.format('MMM YYYY')) {
          for (var term = 1; term <= debt.duration; term++) {
            var debtItem = {};
            debtItem.month = moment(debt.SDate).add(term - 1, 'M').format('MMM YYYY');
            debtItem.PMT = formulajs.PMT(debt.rate / 12 / 100, debt.duration, debt.loanAmount, debt.baloonPayment);
            debtItem.PPMT = formulajs.PPMT(debt.rate / 12 / 100, term, debt.duration, debt.loanAmount, debt.baloonPayment);
            debtItem.IPMT = formulajs.IPMT(debt.rate / 12 / 100, term, debt.duration, debt.loanAmount, debt.baloonPayment);
            debtItem.LB = debt.loanAmount + debtItem.PPMT;
            debtContainer.push(debtItem);
          }
          startDate.add(debt.duration, 'M');
        }
        else {
          var debtItem = {};
          debtItem.month = startDate.format('MMM YYYY');
          debtItem.PMT = 0;
          debtItem.PPMT = 0;
          debtItem.IPMT = 0;
          debtItem.LB = 0;
          debtContainer.push(debtItem);
          startDate.add(1, 'M');
        }
      }
      rawData.debts.push(debtContainer);
      startDate = moment(reset);
    });

    value.invest.forEach(investment => {
      var investmentContainer = [];
      while (!startDate.isAfter(endDate)) {
        if (startDate.format('MMM YYYY') == investment.SDate.format('MMM YYYY')) {
          if (investment.duration) {
            for (var term = 1; term <= investment.duration; term++) {
              var investmentItem = {};
              investmentItem.month = moment(investment.SDate).add(term - 1, 'M').format('MMM YYYY');
              investmentItem.contribution = investment.contribution;
              investmentItem.return = ((investmentContainer[term - 2] ? investmentContainer[term - 2].CB : investment.openBalance) + investment.contribution) * investment.rate / 12 / 100;
              investmentItem.CB = investmentItem.contribution + investmentItem.return + (investmentContainer[term - 2] ? investmentContainer[term - 2].CB : investment.openBalance);
              investmentContainer.push(investmentItem);
            }
            startDate.add(investment.duration, 'M');
          } else {
            var investmentItem = {};
            investmentItem.month = moment(investment.SDate).add(term - 1, 'M').format('MMM YYYY');
            investmentItem.contribution = investment.contribution;
            investmentItem.return = ((investmentContainer[term - 2] ? investmentContainer[term - 2].CB : investment.openBalance) + investment.contribution) * investment.rate / 12 / 100;
            investmentItem.CB = investmentItem.contribution + investmentItem.return + (investmentContainer[term - 2] ? investmentContainer[term - 2].CB : investment.openBalance);
            investmentContainer.push(investmentItem);
            startDate.add(1, 'M');
          }

        } else {
          var investmentItem = {};
          investmentItem.month = startDate.format('MMM YYYY');
          investmentItem.contribution = 0;
          investmentItem.return = 0;
          investmentItem.CB = 0;
          investmentContainer.push(investmentItem);
          startDate.add(1, 'M');
        }
      }
      rawData.investments.push(investmentContainer);
      startDate = moment(reset);
    });
    if(value.spend.length>0){
      while (!startDate.isAfter(endDate)) {
        var spendingItem = {};
        var flag = false;
        value.spend.forEach((spending) => {
          if (startDate.format('MMM YYYY') == spending.SDate.format('MMM YYYY')) {
            flag = true;
            spendingItem.month = startDate.format('MMM YYYY');
            spendingItem.amount = spending.amount;
            rawData.spendings.push(spendingItem);
          }
        });
        if (!flag) {
          spendingItem.month = startDate.format('MMM YYYY');
          spendingItem.amount = 0;
          rawData.spendings.push(spendingItem);
        }
        startDate.add(1, 'M');
      }
      startDate = moment(reset);
    }
    value.decumulation.forEach(decumulation => {
      var decumulationContainer = [];
      while (!startDate.isAfter(endDate)) {
        if (startDate.format('MMM YYYY') == decumulation.SDate.format('MMM YYYY')) {
          if (decumulation.duration) {
            for (var term = 1; term <= decumulation.duration; term++) {
              var decumulationItem = {};
              decumulationItem.month = moment(decumulation.SDate).add(term - 1, 'M').format('MMM YYYY');
              decumulationItem.amount = decumulation.amount;
              decumulationContainer.push(decumulationItem);
            }
            startDate.add(decumulation.duration, 'M');
          } else {
            var decumulationItem = {};
            decumulationItem.month = startDate.format('MMM YYYY');
            decumulationItem.amount = decumulation.amount;
            decumulationContainer.push(decumulationItem);
            startDate.add(1, 'M');
          }
        }
        else {
          var decumulationItem = {};
          decumulationItem.month = startDate.format('MMM YYYY');
          decumulationItem.amount = decumulation.amount;
          decumulationContainer.push(decumulationItem);
          startDate.add(1, 'M');
        }
      }
      rawData.decumulations.push(decumulationContainer);
      startDate = moment(reset);
    });
    while (!startDate.isAfter(endDate)) {
      rawData.length++;
      startDate.add(1, 'M');
    }
    var result = [];
    for (var index = 0; index < rawData.length; index++) {
      var rItem = {};

      rawData.debts.forEach((debt, i) => {
        rItem['-Month-'] = debt[index].month;
        rItem['debt-Payment-' + i] = '$' + -debt[index].PMT.toFixed(2);
        rItem['debt-Principal Amount-' + i] = '$' + -debt[index].PPMT.toFixed(2);
        rItem['debt-Interest Amount-' + i] = '$' + -debt[index].IPMT.toFixed(2);
        rItem['debt-Loan Balance-' + i] = '$' + debt[index].LB.toFixed(2);
      });
      rawData.investments.forEach((investment, i) => {
        rItem['investment-Contribution-' + i] = '$' + investment[index].contribution.toFixed(2);
        rItem['investment-Return-' + i] = '$' + investment[index].return.toFixed(2);
        rItem['investment-Closing Balance-' + i] = '$' + investment[index].CB.toFixed(2);
      });
      if (rawData.spendings[index]) {
        rItem['spending-Spending Amount'] = '$' + rawData.spendings[index].amount.toFixed(2);
      }
      rawData.decumulations.forEach((decumulations, i) => {
        rItem['decumulations-Decumulation Amount-' + i] = '$' + decumulations[index].amount.toFixed(2);
      });
      result.push(rItem);
    }
    this.setState({result});
  };


  validate = () => {
    const {
      form: {validateFieldsAndScroll},
      dispatch
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // submit the values
        dispatch({
          type: 'form/submitAdvancedForm',
          payload: values
        });
        window.asd = values;
        this.generateData(values);
      }
    });
  };

  render () {
    const {
      form: {getFieldDecorator},
      submitting
    } = this.props;
    const {width} = this.state;
    return (

      <PageHeaderWrapper
        title="Generate Form"
        content="Generate your Form"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="User Note (not sure if there is any information we need to collect, so just hold this space"
              className={styles.card} bordered={false}>
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col lg={6} md={12} sm={24}>
                <Form.Item label={fieldLabels.name}>
                  {getFieldDecorator('name', {
                    rules: [{required: true, message: 'Please input your name'}]
                  })(<Input placeholder="Please input your name"/>)}
                </Form.Item>
              </Col>
              <Col xl={{span: 6, offset: 2}} lg={{span: 8}} md={{span: 12}} sm={24}>

              </Col>
              <Col xl={{span: 8, offset: 2}} lg={{span: 10}} md={{span: 24}} sm={24}>

              </Col>
            </Row>
          </Form>
        </Card>
        <Card title="Debt" bordered={false}>
          {getFieldDecorator('debt', {
            initialValue: DebtData
          })(<DebtForm/>)}
        </Card>
        <Card title="Investment" bordered={false}>
          {getFieldDecorator('invest', {
            initialValue: InvestmentData
          })(<InvestmentForm/>)}
        </Card>
        <Card title="Spending" bordered={false}>
          {getFieldDecorator('spend', {
            initialValue: SpendingData
          })(<SpendingForm/>)}
        </Card>
        <Card title="Decumulation" bordered={false}>
          {getFieldDecorator('decumulation', {
            initialValue: DecumulationData
          })(<DecumulationForm/>)}
        </Card>
        {
          this.state.result && <Card title="Result"
                                     className={styles.card} bordered={false}
          >
            <Table dataSource={this.state.result} defaultExpandAllRows={true}
                   scroll={{x: (Object.keys(this.state.result[0]).length * 150) + 'px'}}
                   bordered
            >
              {
                Object.keys(this.state.result[0]).map(name => <Column
                  title={name.split('-')[1]}
                  dataIndex={name}
                  key={name}
                />)
              }

            </Table>

          </Card>
        }
        <FooterToolbar style={{width}}>
          {this.getErrorInfo()}
          <Button type="primary" onClick={this.validate} loading={submitting}>
            Gnerate Form
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
