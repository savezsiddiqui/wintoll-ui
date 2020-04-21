import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import web3 from './web3';
import './index.css';
import styles from './styles';
import wind from './wind';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    Container,
    Row,
    Col,
    Button,
    Form,
    FormLabel,
    FormControl,
    FormGroup,
    Table, Card
} from 'react-bootstrap';

const CarDetails = ({ Car, close }) => {
    return (
        <Card style={{
            width: "20rem", backgroundColor: "#212121",
            color: "#ffffff", position: "fixed", bottom: "50px"
        }}>
            <Card.Body>
                <Card.Title><u>Car Details</u></Card.Title>
                <Card.Text>
                    <p>Owners Name: {Car[0]}</p>
                    <p>Mass: {Car[1]}</p>
                    <p>Average Speed: {Car[2]}</p>
                    <p>Earnings: {Car[3]}</p>
                </Card.Text>
                <Button variant="outline-primary"
                    style={{
                        position: "absolute",
                        top: "15px", right: "15px"
                    }}
                    onClick={close}>close</Button>
            </Card.Body>
        </Card >
    )
}

class App extends Component {

    constructor(props) {

        super(props);
        this.state = {
            formData: {},
            hidden: true
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    async componentDidMount() {
        const balance = await wind.methods.getBalance().call();
        const carsAddresses = await wind.methods.getCars().call();
        const df = await wind.methods.getdf().call();
        this.setState({ balance, carsAddresses, df });
    }

    onChange(event) {
        const value = event.target.value;
        const name = event.target.name;
        if (name === "info")
            this.setState({
                addr: value
            })
        else
            this.setState({
                formData: {
                    ...this.state.formData,
                    [name]: value
                }
            });
    }

    async onSubmit(event) {
        event.preventDefault();
        console.log(JSON.stringify(this.state.formData, undefined, 2));
        const data = this.state.formData;
        const accounts = await web3.eth.getAccounts();
        await wind.methods.AddCars(data.addr, data.owner, data.speed, data.mass).send({
            from: accounts[0]
        });
        this.componentDidMount();
    }

    render() {
        if (this.state.df === undefined)
            return (<h1>Loading.......</h1>)
        else {
            return (
                <Container>
                    <Row>
                        <Col xs={12} sm={6} className="mt-4" style={{ height: "96vh", overflow: "auto" }}>
                            <h2><u>Wind Toll-Tax Ether Distribution</u></h2>
                            {/* <hr style={{ backgroundColor: "#ffffff" }} /> */}
                            <h5>Balance in Reserve: {this.state.balance} wei</h5>
                            <h5>Cars Passed: {this.state.carsAddresses === undefined ? 0 : this.state.carsAddresses.length}</h5>
                            <h5> Daily Factor: {this.state.df}</h5>
                            <hr style={{ backgroundColor: "#ffffff" }} />

                            <h3>Add Cars</h3>
                            <Form onSubmit={this.onSubmit} className="mt-4">
                                <FormGroup>
                                    <FormLabel>Car Owner's Name</FormLabel>
                                    <FormControl type="text"
                                        style={styles.input}
                                        name="owner"
                                        onChange={this.onChange}
                                        value={this.state.formData.owner}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>Etherium Address</FormLabel>
                                    <FormControl type="text"
                                        name="addr"
                                        style={styles.input}
                                        onChange={this.onChange}
                                        value={this.state.formData.addr}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Form.Row>
                                        <Col>
                                            <FormLabel>Mass</FormLabel>
                                            <FormControl type="number"
                                                name="mass"
                                                style={styles.input}
                                                onChange={this.onChange}
                                                value={this.state.formData.mass}
                                                required
                                            />
                                        </Col>
                                        <Col>
                                            <FormLabel>Average Speed</FormLabel>
                                            <FormControl type="number"
                                                name="speed"
                                                style={styles.input}
                                                onChange={this.onChange}
                                                value={this.state.formData.speed}
                                                required
                                            />
                                        </Col>
                                    </Form.Row>
                                </FormGroup>
                                <FormGroup>
                                    <Button type="submit">Submit</Button>
                                </FormGroup>
                            </Form>
                            <hr style={{ backgroundColor: "#ffffff" }} />
                            <Form>
                                <FormGroup>
                                    <FormLabel>Set Daily Factor</FormLabel>
                                    <FormControl
                                        type="range"
                                        min="10"
                                        max="1000"
                                        value={this.state.df}
                                        onChange={(event) => {
                                            this.setState({
                                                df: event.target.value
                                            })
                                        }}
                                        onMouseUp={async (event) => {
                                            const accounts = await web3.eth.getAccounts();
                                            await wind.methods.setdf(this.state.df).send({
                                                from: accounts[0]
                                            });
                                            this.componentDidMount();
                                        }}
                                    />
                                </FormGroup>
                            </Form>
                        </Col>

                        <Col xs={12} sm={6} className="mt-4">
                            <h2><u>Addresses Paid</u></h2>
                            <Table striped bordered hover className="mt-4">
                                {
                                    this.state.carsAddresses.map((car) => {
                                        return (<tr key={car}><td>{car}</td></tr>)
                                    })
                                }
                            </Table>
                            <hr style={{ backgroundColor: "#ffffff" }} />
                            <h5>Total Amount Spent: {1000000000000000000 - this.state.balance} wei</h5>

                            {this.state.hidden === false ?
                                <CarDetails Car={this.state.Car} close={() => {
                                    this.setState({ hidden: true })
                                }} /> : null}

                            <Row style={{ position: "fixed", bottom: "0px", width: "26rem" }}>
                                <Col>
                                    <FormGroup>
                                        <Form.Row>
                                            <Col xs={8}>
                                                <FormControl type="text"
                                                    name="info"
                                                    placeholder="address"
                                                    style={styles.input}
                                                    onChange={this.onChange}
                                                    value={this.state.addr}
                                                    required
                                                />
                                            </Col>
                                            <Col xs={4}>
                                                <Button onClick={async () => {
                                                    const Car = await wind.methods.getCar(this.state.addr).call();
                                                    console.log("Car Details", JSON.stringify(Car, undefined, 2));
                                                    this.setState({
                                                        Car,
                                                        hidden: false
                                                    })
                                                }}>Get Data</Button>
                                            </Col>
                                        </Form.Row>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                </Container>
            )
        }
    }
}


ReactDOM.render(<App />, document.getElementById('root'));