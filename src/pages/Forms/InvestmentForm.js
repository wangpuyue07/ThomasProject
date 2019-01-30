import React, {PureComponent, Fragment} from 'react';
import {Table, Button, Input, message, Popconfirm, Divider, DatePicker, Radio} from 'antd';
import isEqual from 'lodash/isEqual';
import styles from './style.less';
import moment from 'moment';

const {MonthPicker} = DatePicker;
const RadioGroup = Radio.Group;

class DebtForm extends PureComponent {
  index = 0;

  cacheOriginData = {};

  constructor (props) {
    super(props);

    this.state = {
      data: props.value,
      loading: false,
      /* eslint-disable-next-line react/no-unused-state */
      value: props.value
    };
  }

  static getDerivedStateFromProps (nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null;
    }
    return {
      data: nextProps.value,
      value: nextProps.value
    };
  }

  getRowByKey (key, newData) {
    const {data} = this.state;
    return (newData || data).filter(item => item.key === key)[0];
  }

  toggleEditable = (e, key) => {
    e.preventDefault();
    const {data} = this.state;
    const newData = data.map(item => ({...item}));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = {...target};
      }
      target.editable = !target.editable;
      this.setState({data: newData});
    }
  };

  newMember = () => {
    const {data} = this.state;
    const newData = data.map(item => ({...item}));
    newData.push({
      key: `NEW_TEMP_ID_${this.index}`,
      openBalance: 0,
      rate: 0,
      contribution: 0,
      SDate: moment(),
      duration: false,
      editable: true,
      isNew: true
    });
    this.index += 1;
    this.setState({data: newData});
  };

  remove (key) {
    const {data} = this.state;
    const {onChange} = this.props;
    const newData = data.filter(item => item.key !== key);
    this.setState({data: newData});
    onChange(newData);
  }

  handleKeyPress (e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }

  handleFieldChange (e, fieldName, key) {
    const {data} = this.state;
    const newData = data.map(item => ({...item}));
    const target = this.getRowByKey(key, newData);
    if (target) {
      if (e && e.target) {
        target[fieldName] = isNaN(e.target.value)?e.target.value:+e.target.value;
      } else {
        target[fieldName] = e;
      }

      this.setState({data: newData});
    }
  }

  saveRow (e, key) {
    e.persist();
    this.setState({
      loading: true
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      if (!target.openBalance || !target.rate || !target.contribution || !target.SDate) {
        message.error('Please complete this row');
        e.target.focus();
        this.setState({
          loading: false
        });
        return;
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      const {data} = this.state;
      const {onChange} = this.props;
      onChange(data);
      this.setState({
        loading: false
      });
    }, 500);
  }

  cancel (e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const {data} = this.state;
    const newData = data.map(item => ({...item}));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      delete this.cacheOriginData[key];
    }
    target.editable = false;
    this.setState({data: newData});
    this.clickedCancel = false;
  }

  render () {
    const columns = [
      {
        title: 'Opening Balance ($)',
        dataIndex: 'openBalance',
        key: 'openBalance',
        width: '16%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                type={'number'}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'openBalance', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="Initial investment amount"
              />
            );
          }
          return '$' + text.toLocaleString();
        }
      },
      {
        title: 'Return Rate (%)',
        dataIndex: 'rate',
        key: 'rate',
        width: '16%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                type={'number'}
                value={text}
                onChange={e => this.handleFieldChange(e, 'rate', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="Average annual return"
              />
            );
          }
          return text + '%';
        }
      },
      {
        title: 'Contribution ($)',
        dataIndex: 'contribution',
        key: 'contribution',
        width: '16%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                type={'number'}
                value={text}
                onChange={e => this.handleFieldChange(e, 'contribution', record.key)}
                onKeyPress={e => this.handleKeyPress(e, record.key)}
                placeholder="Monthly regular contribution"
              />
            );
          }
          return '$' + text;
        }
      },
      {
        title: 'Start Date',
        dataIndex: 'SDate',
        key: 'SDate',
        width: '16%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <MonthPicker value={text}
                           onChange={e => this.handleFieldChange(e, 'SDate', record.key)}
                           placeholder="duration"/>
            );
          }
          return text.format('MMM YYYY');
          ;
        }
      },
      {
        title: 'Duration (months)',
        dataIndex: 'duration',
        key: 'duration',
        width: '16%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <RadioGroup onChange={e => e.target.value && this.handleFieldChange(false, 'duration', record.key)}
                          value={text ? 1 : 2}>
                <Radio value={1}><Input
                  type={'number'}
                  value={text}
                  onChange={e => this.handleFieldChange(e, 'duration', record.key)}
                  onKeyPress={e => this.handleKeyPress(e, record.key)}
                  placeholder="duration"
                  style={{width: '80%'}}
                /></Radio>
                <Radio value={2}>Perpetual</Radio>
              </RadioGroup>
            );

          }
          else {
            if (text) {
              return text + ' months';
            } else {
              return 'Perpetual';
            }
          }

        }
      },
      {
        title: 'manage',
        key: 'action',
        render: (text, record) => {
          const {loading} = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.key)}>add</a>
                  <Divider type="vertical"/>
                  <Popconfirm title="are you sure you want to delete this row?"
                              onConfirm={() => this.remove(record.key)}>
                    <a>delete</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key)}>save</a>
                <Divider type="vertical"/>
                <a onClick={e => this.cancel(e, record.key)}>cancel</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>edit</a>
              <Divider type="vertical"/>
              <Popconfirm title="are you sure you want to delete this row?？" onConfirm={() => this.remove(record.key)}>
                <a>delete</a>
              </Popconfirm>
            </span>
          );
        }
      }
    ];

    const {loading, data} = this.state;

    return (
      <Fragment>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
        />
        <Button
          style={{width: '100%', marginTop: 16, marginBottom: 8}}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          Add Investment
        </Button>
      </Fragment>
    );
  }
}

export default DebtForm;
